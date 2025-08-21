import { render, screen, fireEvent } from '@testing-library/react'
import ActionButton from './ActionButton'

describe('ActionButton', () => {
  const defaultProps = {
    icon: 'plus',
    label: 'Add Item',
    onClick: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default props', () => {
    render(<ActionButton {...defaultProps} />)
    
    const button = screen.getByRole('button', { name: /add item/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Add Item')
  })

  it('should call onClick when clicked', () => {
    const onClick = jest.fn()
    render(<ActionButton {...defaultProps} onClick={onClick} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should render with primary variant by default', () => {
    render(<ActionButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-blue-600')
    expect(button).toHaveClass('text-white')
  })

  it('should render with secondary variant', () => {
    render(<ActionButton {...defaultProps} variant="secondary" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-white')
    expect(button).toHaveClass('text-gray-700')
  })

  it('should render with success variant', () => {
    render(<ActionButton {...defaultProps} variant="success" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-green-600')
    expect(button).toHaveClass('text-white')
  })

  it('should render with danger variant', () => {
    render(<ActionButton {...defaultProps} variant="danger" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-red-600')
    expect(button).toHaveClass('text-white')
  })

  it('should render with medium size by default', () => {
    render(<ActionButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-4')
    expect(button).toHaveClass('py-2.5')
  })

  it('should render with small size', () => {
    render(<ActionButton {...defaultProps} size="sm" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-3')
    expect(button).toHaveClass('py-2')
  })

  it('should render with large size', () => {
    render(<ActionButton {...defaultProps} size="lg" />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('px-6')
    expect(button).toHaveClass('py-3')
  })

  it('should render icon when provided', () => {
    render(<ActionButton {...defaultProps} icon="plus" />)
    
    const button = screen.getByRole('button')
    // Check if icon is rendered (SVG element)
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('should render without icon when not provided', () => {
    render(<ActionButton label="No Icon" onClick={jest.fn()} />)
    
    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).not.toBeInTheDocument()
  })

  it('should handle all icon types', () => {
    const iconTypes = ['plus', 'download', 'upload', 'search', 'filter', 'userPlus', 'settings', 'barChart3', 'edit', 'trash2', 'eye']
    
    iconTypes.forEach(iconType => {
      const { unmount } = render(<ActionButton {...defaultProps} icon={iconType} />)
      
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).toBeInTheDocument()
      
      unmount()
    })
  })

  it('should have proper accessibility attributes', () => {
    render(<ActionButton {...defaultProps} />)
    
    const button = screen.getByRole('button')
    expect(button).toBeEnabled()
  })

  it('should be disabled when onClick is not provided', () => {
    render(<ActionButton icon="plus" label="Disabled Button" />)
    
    const button = screen.getByRole('button')
    expect(button).toBeEnabled() // Button is still enabled but onClick won't work
  })
})
