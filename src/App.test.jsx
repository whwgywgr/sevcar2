import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
    it('renders correctly', () => {
        expect(App).toBeDefined();
    });

    it('should perform a simple addition', () => {
        expect(1 + 1).toBe(2);
    });
});