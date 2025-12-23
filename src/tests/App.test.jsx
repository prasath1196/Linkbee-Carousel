import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../App';
import AuthWrapper from '../components/AuthWrapper';

// --- MOCKS ---

// Mock Firebase Auth and DB
vi.mock('../firebase', () => ({
    auth: { currentUser: { uid: '123', displayName: 'Test User' } },
    signInWithGoogle: vi.fn(),
    logout: vi.fn(),
    db: {}
}));

// Mock the Service Layer directly to avoid complex Firebase mocking
vi.mock('../services/db', () => ({
    getUserProfile: vi.fn(),
    saveUserProfile: vi.fn(),
    getAllProjects: vi.fn(() => Promise.resolve([])), // Empty dashboard
    saveProject: vi.fn(),
    logTokenUsage: vi.fn()
}));

// Mock AI Service
vi.mock('../services/ai', () => ({
    generateStructure: vi.fn(),
    generateSlideContent: vi.fn()
}));

// Mock Firebase Auth Module
vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        onAuthStateChanged: vi.fn((auth, cb) => cb(null)),
        getAuth: vi.fn(),
        GoogleAuthProvider: vi.fn(),
        signInWithPopup: vi.fn(),
        signInWithRedirect: vi.fn(),
    };
});

import { getUserProfile, saveUserProfile } from '../services/db';
import { generateStructure, generateSlideContent } from '../services/ai';
import { signInWithGoogle } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth'; // Import for usage in tests

describe('Authentication Flow', () => {

    it('shows Landing Page when user is NOT logged in', async () => {
        // Override auth mock for this specific test
        const { auth } = await import('../firebase');
        auth.currentUser = null;

        // Mock onAuthStateChanged behavior
        const { onAuthStateChanged } = await import('firebase/auth');
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            callback(null); // Simulate no user
            return () => { };
        });

        render(
            <AuthWrapper>
                <App />
            </AuthWrapper>
        );

        expect(screen.getByText(/Create Viral Carousels/i)).toBeInTheDocument(); // From LandingPage
        expect(screen.getByText(/Log In/i)).toBeInTheDocument();
    });

    it('triggers Google Login when button clicked', async () => {
        // Setup "Not Logged In" state again
        const { onAuthStateChanged } = await import('firebase/auth');
        vi.mocked(onAuthStateChanged).mockImplementation((_, cb) => cb(null));

        render(<AuthWrapper><App /></AuthWrapper>);

        const loginBtn = screen.getByText('Log In');
        fireEvent.click(loginBtn);

        expect(signInWithGoogle).toHaveBeenCalled();
    });

    it('shows Onboarding when logged in but NO profile exists', async () => {
        const { onAuthStateChanged } = await import('firebase/auth');
        // Simulate logged in user
        vi.mocked(onAuthStateChanged).mockImplementation((_, cb) => cb({ uid: '123', email: 'test@test.com' }));
        // Simulate NO profile in DB
        vi.mocked(getUserProfile).mockResolvedValue(null);

        render(<AuthWrapper><App /></AuthWrapper>);

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.getByText(/One last thing/i)).toBeInTheDocument(); // From AuthWrapper
        });

        // Test completing onboarding
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Founder' } });
        fireEvent.click(screen.getByText(/Complete Setup/i));

        await waitFor(() => {
            expect(saveUserProfile).toHaveBeenCalledWith(expect.objectContaining({
                role: 'Founder',
                uid: '123'
            }));
        });
    });
});

describe('AI Generation & Editor Flow', () => {
    beforeEach(async () => {
        // Reset Mocks
        vi.clearAllMocks();
        // Setup authenticated state with profile
        const { onAuthStateChanged } = await import('firebase/auth');
        vi.mocked(onAuthStateChanged).mockImplementation((_, cb) => cb({ uid: '123', displayName: 'Tester' }));
        vi.mocked(getUserProfile).mockResolvedValue({ uid: '123', role: 'Tester' });

        // Mock LocalStorage for API Key
        window.localStorage.getItem.mockReturnValue('fake-api-key');
    });

    it('loads Dashboard and navigates to New Project', async () => {
        render(<AuthWrapper><App /></AuthWrapper>);

        // Check Dashboard loaded
        await waitFor(() => {
            expect(screen.getByText(/Hello, Tester/i)).toBeInTheDocument(); // From Dashboard
        });
    });

    it('Generates Structure from Topic', async () => {
        // Mock the AI Response
        const mockStructure = [
            { id: 1, title: "Slide 1 Hook", purpose: "Intro" },
            { id: 2, title: "Slide 2 Main", purpose: "Body" }
        ];
        generateStructure.mockResolvedValue({ data: mockStructure, usage: {} });

        render(<AuthWrapper><App /></AuthWrapper>);

        // 1. Manually navigate to Editor (simulate flow)
        // Since we test the dashboard click separately, let's force the view to 'editor' 
        // by mocking the state if possible, or just clicking through.
        // Clicking through is safer.
        await waitFor(() => expect(screen.getByRole('button', { name: /Create New/i })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /Create New/i }));

        // 2. Enter Topic
        const textarea = screen.getByPlaceholderText(/e.g. 'How to mitigate/i);
        fireEvent.change(textarea, { target: { value: 'React Testing' } });

        // 3. Click Generate
        const generateBtn = screen.getByText(/Start Draft/i);
        fireEvent.click(generateBtn);

        // 4. Verify AI call
        expect(generateStructure).toHaveBeenCalledWith('React Testing', 'fake-api-key');

        // 5. Continue to Content Generation
        await waitFor(() => expect(screen.getByText(/Continue to Content/i)).toBeInTheDocument());
        const continueBtn = screen.getByText(/Continue to Content/i);

        // Mock Content API response
        const mockSlides = [
            { title: "Slide 1", content: ["Point 1", "Point 2"], visual: "Abstract Blue" }
        ];
        generateSlideContent.mockResolvedValue({ data: mockSlides, usage: {} });

        fireEvent.click(continueBtn);

        // 6. Verify Content Generation Call
        await waitFor(() => {
            expect(generateSlideContent).toHaveBeenCalledWith(mockStructure, 'fake-api-key');
        });
    });
});

describe('Error Handling', () => {
    it('Displays error when API Key is missing', async () => {
        // Mock No Key
        window.localStorage.getItem.mockReturnValue(null);
        // Setup authenticated state
        const { onAuthStateChanged } = await import('firebase/auth');
        vi.mocked(onAuthStateChanged).mockImplementation((_, cb) => cb({ uid: '123', displayName: 'Tester' }));
        vi.mocked(getUserProfile).mockResolvedValue({ uid: '123', role: 'Tester' });

        render(<AuthWrapper><App /></AuthWrapper>);

        // Go to generation
        await waitFor(() => expect(screen.getByRole('button', { name: /Create New/i })).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /Create New/i }));

        fireEvent.change(screen.getByPlaceholderText(/mitigate/i), { target: { value: 'Topic' } });
        fireEvent.click(screen.getByText(/Start Draft/i));

        // Expect Toast/Error
        await waitFor(() => {
            expect(screen.getByText(/API Key missing/i)).toBeInTheDocument();
        });
    });
});
