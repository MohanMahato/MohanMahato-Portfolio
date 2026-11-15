import { Component } from 'react'

// Catches crashes so visitors see a friendly message instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) console.error(error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center text-fg">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted">Please refresh the page. If the problem continues, try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white"
        >
          Reload page
        </button>
      </div>
    )
  }
}
