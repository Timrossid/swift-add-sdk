import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Ad402Provider } from '../Ad402Provider';

describe('Ad402Provider - Configuration Validation', () => {
  describe('Error Handling', () => {
    it('should render error when websiteId is missing', () => {
      const invalidConfig = {
        websiteId: '',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      render(
        <Ad402Provider config={invalidConfig}>
          <div>Child Content</div>
        </Ad402Provider>
      );

      expect(screen.getByText('Ad402 Configuration Error:')).toBeInTheDocument();
      expect(screen.getByText('websiteId is required in Ad402Config')).toBeInTheDocument();
    });

    it('should render error when walletAddress is missing', () => {
      const invalidConfig = {
        websiteId: 'test-website',
        walletAddress: ''
      };

      render(
        <Ad402Provider config={invalidConfig}>
          <div>Child Content</div>
        </Ad402Provider>
      );

      expect(screen.getByText('Ad402 Configuration Error:')).toBeInTheDocument();
      expect(screen.getByText('walletAddress is required in Ad402Config')).toBeInTheDocument();
    });

    it('should render error when walletAddress has invalid format', () => {
      const invalidConfigs = [
        'invalid-address',
        '0xinvalid',
        '0x123',
        '742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // missing 0x prefix
        '0xG42d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // invalid hex character
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6extra' // too long
      ];

      invalidConfigs.forEach((invalidAddress) => {
        const invalidConfig = {
          websiteId: 'test-website',
          walletAddress: invalidAddress
        };

        const { unmount } = render(
          <Ad402Provider config={invalidConfig}>
            <div>Child Content</div>
          </Ad402Provider>
        );

        expect(screen.getByText('Ad402 Configuration Error:')).toBeInTheDocument();
        expect(screen.getByText('walletAddress must be a valid Ethereum address (0x...)')).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should render children when configuration is valid', () => {
      const validConfig = {
        websiteId: 'test-website',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      };

      render(
        <Ad402Provider config={validConfig}>
          <div data-testid="child-content">Child Content</div>
        </Ad402Provider>
      );

      expect(screen.queryByText('Ad402 Configuration Error:')).not.toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle valid Ethereum addresses with mixed case', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0x742D35CC6634C0532925A3B8D4C9DB96C4B4D8B6',
        '0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'
      ];

      validAddresses.forEach((validAddress) => {
        const validConfig = {
          websiteId: 'test-website',
          walletAddress: validAddress
        };

        const { unmount } = render(
          <Ad402Provider config={validConfig}>
            <div data-testid="child-content">Child Content</div>
          </Ad402Provider>
        );

        expect(screen.queryByText('Ad402 Configuration Error:')).not.toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should handle configuration changes dynamically', () => {
      const { rerender } = render(
        <Ad402Provider config={{ websiteId: '', walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' }}>
          <div data-testid="child-content">Child Content</div>
        </Ad402Provider>
      );

      // Initially should show error
      expect(screen.getByText('Ad402 Configuration Error:')).toBeInTheDocument();

      // Update to valid config
      rerender(
        <Ad402Provider config={{ websiteId: 'valid-website', walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' }}>
          <div data-testid="child-content">Child Content</div>
        </Ad402Provider>
      );

      // Should render children
      expect(screen.queryByText('Ad402 Configuration Error:')).not.toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });

  describe('Default Configuration Merging', () => {
    it('should merge user config with defaults', () => {
      const userConfig = {
        websiteId: 'test-website',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        theme: {
          primaryColor: '#ff0000'
        }
      };

      render(
        <Ad402Provider config={userConfig}>
          <div data-testid="child-content">Child Content</div>
        </Ad402Provider>
      );

      expect(screen.queryByText('Ad402 Configuration Error:')).not.toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });
});
