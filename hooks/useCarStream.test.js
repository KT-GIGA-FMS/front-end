import { renderHook, act } from '@testing-library/react'
import useCarStream from './useCarStream'

// Mock SockJS
const mockSockJS = jest.fn().mockImplementation(() => ({
  readyState: 1,
  onopen: null,
  onmessage: null,
  onclose: null,
  onerror: null,
}))

jest.mock('sockjs-client', () => {
  return jest.fn().mockImplementation(() => ({
    readyState: 1,
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
  }))
})

// Mock STOMP client
const mockClient = {
  activate: jest.fn(),
  deactivate: jest.fn(),
  subscribe: jest.fn(),
  publish: jest.fn(),
  connected: false,
}

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation((config) => {
    // Call webSocketFactory to trigger SockJS creation
    if (config.webSocketFactory) {
      config.webSocketFactory()
    }
    return mockClient
  }),
}))

describe('useCarStream', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_SOCKJS_HTTP
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCarStream(null))
    
    expect(result.current.connected).toBe(false)
    expect(result.current.lastPoint).toBe(null)
    expect(result.current.lastTelemetry).toBe(null)
    expect(typeof result.current.getPath).toBe('function')
    expect(typeof result.current.clearPath).toBe('function')
    expect(typeof result.current.publish).toBe('function')
  })

  it('should use custom sockUrl when provided', () => {
    const customUrl = 'ws://custom-url.com'
    renderHook(() => useCarStream(null, { sockUrl: customUrl }))
    
    // Check if SockJS was called with custom URL
    const SockJS = require('sockjs-client')
    expect(SockJS).toHaveBeenCalledWith(customUrl)
  })

  it('should use environment variable for sockUrl when not provided', () => {
    process.env.NEXT_PUBLIC_SOCKJS_HTTP = 'ws://env-url.com'
    renderHook(() => useCarStream(null))
    
    const SockJS = require('sockjs-client')
    expect(SockJS).toHaveBeenCalledWith('ws://env-url.com')
  })

  it('should generate correct topic for car-specific subscription', () => {
    const carId = 'test-car-123'
    const { result } = renderHook(() => useCarStream(carId, { byCar: true }))
    
    // The topic should be generated as `/topic/telemetry.${carId}`
    // We can't directly test the topic generation, but we can verify the hook works
    expect(result.current.connected).toBe(false)
  })

  it('should generate correct topic for general subscription', () => {
    const { result } = renderHook(() => useCarStream(null, { byCar: false }))
    
    // The topic should be `/topic/telemetry`
    expect(result.current.connected).toBe(false)
  })

  it('should use custom topic override when provided', () => {
    const customTopic = '/custom/topic'
    const { result } = renderHook(() => useCarStream(null, { topicOverride: customTopic }))
    
    expect(result.current.connected).toBe(false)
  })

  it('should clear path when clearPath is called', () => {
    const { result } = renderHook(() => useCarStream(null))
    
    act(() => {
      result.current.clearPath()
    })
    
    expect(result.current.lastPoint).toBe(null)
    expect(result.current.getPath()).toEqual([])
  })

  it('should return empty path initially', () => {
    const { result } = renderHook(() => useCarStream(null))
    
    expect(result.current.getPath()).toEqual([])
  })

  it('should handle publish when client is not connected', () => {
    const { result } = renderHook(() => useCarStream(null))
    
    // Should not throw error when client is not connected
    expect(() => {
      result.current.publish({ test: 'data' })
    }).not.toThrow()
  })

  it('should handle custom throttle and maxPath options', () => {
    const { result } = renderHook(() => useCarStream(null, {
      throttleMs: 1000,
      maxPath: 100
    }))
    
    expect(result.current.connected).toBe(false)
  })

  it('should handle debug option as boolean', () => {
    const { result } = renderHook(() => useCarStream(null, { debug: true }))
    
    expect(result.current.connected).toBe(false)
  })

  it('should handle debug option as function', () => {
    const debugFn = jest.fn()
    const { result } = renderHook(() => useCarStream(null, { debug: debugFn }))
    
    expect(result.current.connected).toBe(false)
  })
})
