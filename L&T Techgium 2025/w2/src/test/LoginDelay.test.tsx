import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

describe('Login Page', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('shows loading state when clicking sign in', async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        const button = screen.getByRole('button', { name: /sign in/i });

        // Click button
        fireEvent.click(button);

        // Should show loading text
        expect(screen.getByText('Signing In...')).toBeInTheDocument();
        expect(button).toBeDisabled();

        // Fast forward time
        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        // We can't easily check navigation here without more complex mocking, 
        // but we validated the loading state which is the core request.
    });
});
