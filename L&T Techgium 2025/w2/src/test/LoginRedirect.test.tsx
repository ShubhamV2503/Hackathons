import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import AppLayout from '../components/AppLayout';
import { AuthProvider } from '../context/AuthContext';

// Mock the AppSidebar to avoid rendering complex children
vi.mock('../components/AppSidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('AppLayout Navigation', () => {
    it('redirects to login when unauthenticated', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/"
                            element={
                                <AppLayout>
                                    <div>Protected Content</div>
                                </AppLayout>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        // Should NOT see protected content
        expect(screen.queryByText('Protected Content')).toBeNull();
        // Should see Login Page immediately
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('allows access when authenticated', () => {
        // Simulate authenticated user
        const user = { username: 'testuser', role: 'instructor' };
        localStorage.setItem('mindflow_user', JSON.stringify(user));

        render(
            <MemoryRouter initialEntries={['/']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<div>Login Page</div>} />
                        <Route
                            path="/"
                            element={
                                <AppLayout>
                                    <div>Protected Content</div>
                                </AppLayout>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        // Should see protected content
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        // Should NOT see Login Page
        expect(screen.queryByText('Login Page')).toBeNull();

        // Cleanup
        localStorage.removeItem('mindflow_user');
    });
});
