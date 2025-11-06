/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classNames: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveValue(value: string | number): R
      toBeChecked(): R
    }
  }
}

export {}
