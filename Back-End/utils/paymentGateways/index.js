/**
 * Payment Gateway Factory
 * Routes to appropriate payment gateway based on configuration
 * Supports: MOCK (development), FAWRY (Egypt), PAYPAL (international)
 */

const mockGateway = require('./mock.gateway');
const fawryGateway = require('./fawry.gateway');
const paypalGateway = require('./paypal.gateway');

class GatewayFactory {
  constructor() {
    this.gateways = {
      MOCK: mockGateway,
      FAWRY: fawryGateway,
      PAYPAL: paypalGateway,
    };

    // Primary gateway (from env or MOCK by default)
    this.primaryProvider = (process.env.PAYMENT_PROVIDER || 'MOCK').toUpperCase();

    // Fallback gateways (for when primary fails)
    this.fallbackProviders = (process.env.PAYMENT_FALLBACK || 'MOCK')
      .toUpperCase()
      .split(',')
      .map((p) => p.trim());

    // Payment processing environment
    this.environment = process.env.PAYMENT_ENV || 'development';
  }

  /**
   * Get primary gateway instance
   */
  getPrimaryGateway() {
    const gateway = this.gateways[this.primaryProvider];
    if (!gateway) {
      throw new Error(`Unknown payment provider: ${this.primaryProvider}`);
    }
    return gateway;
  }

  /**
   * Get specific gateway by name
   */
  getGateway(providerName) {
    const provider = providerName.toUpperCase();
    const gateway = this.gateways[provider];
    if (!gateway) {
      throw new Error(`Unknown payment provider: ${provider}`);
    }
    return gateway;
  }

  /**
   * Get fallback gateway (if primary fails)
   */
  getFallbackGateway() {
    for (const provider of this.fallbackProviders) {
      if (provider !== this.primaryProvider && this.gateways[provider]) {
        return this.gateways[provider];
      }
    }
    return null;
  }

  /**
   * Process payment with primary gateway, fallback if needed
   */
  async chargeWithFallback(paymentData, options = {}) {
    const primaryGateway = this.getPrimaryGateway();
    const fallbackGateway = this.getFallbackGateway();
    const { allowFallback = true, retryOnFallback = true } = options;

    try {
      console.log(`[PAYMENT] Processing with ${this.primaryProvider} gateway`);
      const result = await primaryGateway.charge(paymentData);
      return {
        ...result,
        gateway: this.primaryProvider,
      };
    } catch (error) {
      console.error(
        `[PAYMENT_ERROR] Primary gateway (${this.primaryProvider}) failed:`,
        error.message
      );

      // If error is not retryable, don't attempt fallback
      if (!error.retryable && !allowFallback) {
        throw error;
      }

      // Try fallback gateway if available
      if (allowFallback && fallbackGateway && retryOnFallback) {
        try {
          console.log(`[PAYMENT] Retrying with fallback gateway`);
          const result = await fallbackGateway.charge(paymentData);
          return {
            ...result,
            gateway: fallbackGateway.name,
            fallbackUsed: true,
          };
        } catch (fallbackError) {
          console.error(
            '[PAYMENT_ERROR] Fallback gateway also failed:',
            fallbackError.message
          );
          throw fallbackError;
        }
      }

      throw error;
    }
  }

  /**
   * Get available payment methods in current environment
   */
  getAvailableProviders() {
    return Object.keys(this.gateways);
  }

  /**
   * Check if provider is enabled
   */
  isProviderEnabled(provider) {
    return !!this.gateways[provider.toUpperCase()];
  }

  /**
   * Get payment environment info (for debugging)
   */
  getEnvironmentInfo() {
    return {
      environment: this.environment,
      primaryProvider: this.primaryProvider,
      fallbackProviders: this.fallbackProviders,
      availableProviders: this.getAvailableProviders(),
      testMode: this.primaryProvider === 'MOCK' || 
                this.primaryProvider === 'FAWRY' && process.env.FAWRY_TEST_MODE === 'true',
    };
  }
}

// Create singleton instance
const factory = new GatewayFactory();

// Export convenience functions
module.exports = {
  // Get primary gateway instance
  getPrimary: () => factory.getPrimaryGateway(),

  // Get specific gateway
  get: (provider) => factory.getGateway(provider),

  // Charge with fallback support
  charge: async (paymentData, options) =>
    factory.chargeWithFallback(paymentData, options),

  // Get gateway names
  getAvailable: () => factory.getAvailableProviders(),

  // Environment info
  getInfo: () => factory.getEnvironmentInfo(),

  // Factory instance (for advanced usage)
  factory,
};

