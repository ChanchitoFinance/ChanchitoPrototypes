import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border-color mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              MVO Platform
            </h3>
            <p className="text-sm text-text-secondary">
              Validate your business idea in 48 hours
            </p>
          </div>

          <div>
            <h4 className="text-base font-medium text-text-primary mb-4">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ideas"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Browse Ideas
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Submit Idea
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium text-text-primary mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium text-text-primary mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-color text-center text-sm text-text-secondary">
          <p>&copy; {new Date().getFullYear()} MVO Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

