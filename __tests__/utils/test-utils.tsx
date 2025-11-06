import { render, RenderOptions, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function with providers if needed in the future
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // In the future, you can add providers here like:
  // <SWRConfig value={{ provider: () => new Map() }}>
  //   {ui}
  // </SWRConfig>
  return render(ui, options)
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export * from '@testing-library/jest-dom'
export { screen, waitFor }
export { customRender as render }
