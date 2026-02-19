'use client'

import Link from 'next/link'
import { useLocale } from '@/shared/components/providers/I18nProvider'

export default function NdaPage() {
  const { locale } = useLocale()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-text-primary mb-4">
            Confidentiality and Non-Disclosure Agreement (NDA) MVO
          </h1>
          <p className="text-text-secondary text-sm">
            Last Updated: 2/18/2026
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Platform / Company: Chanchito · Contact: chanchito.app.org@gmail.com
          </p>
        </div>

        <div className="space-y-6 text-text-secondary leading-relaxed">
          <p>
            This Confidentiality and Non-Disclosure Agreement (&quot;Agreement&quot;) is entered into between Company and you (&quot;User&quot;) as of the date you click &quot;I Agree&quot; or otherwise access or use the Platform where confidential content may be displayed (the &quot;Effective Date&quot;).
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">1) Purpose</h2>
            <p>
              The Platform enables users to create, share, review, and validate ideas, business concepts, product plans, documents, research, data, media, and discussions (&quot;Purpose&quot;). In using the Platform, you may access Confidential Information (defined below). You agree to protect it as described here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">2) Definitions</h2>
            <h3 className="text-lg font-medium text-text-primary mb-2">2.1 &quot;Confidential Information&quot;</h3>
            <p className="mb-2">
              means any non-public information disclosed or made available on or through the Platform, whether by Company or by other users (&quot;Disclosing Party&quot;), including without limitation:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>ideas, concepts, prototypes, product specs, roadmaps, designs, wireframes, source code, prompts, model outputs, algorithms;</li>
              <li>business plans, pricing, customers, suppliers, strategy, metrics, validation data, market research;</li>
              <li>user content marked confidential or that a reasonable person would understand to be confidential given the nature of the information and context;</li>
              <li>private messages, workspace content, drafts, and unpublished posts;</li>
              <li>any derived notes, summaries, screenshots, exports, analyses, or copies of the above.</li>
            </ul>
            <p className="mb-2"><strong>2.2 &quot;Recipient&quot;</strong> means the person accessing Confidential Information (you, in most cases).</p>
            <p><strong>2.3 &quot;User Content&quot;</strong> means content you upload, post, submit, or generate on the Platform (including idea pages, attachments, comments, and messages).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">3) Confidentiality Obligations</h2>
            <p className="mb-2">You agree that you will:</p>
            <p className="mb-2"><strong>3.1 Use Limitation.</strong> Use Confidential Information only for the Purpose and only within the Platform features intended for that use.</p>
            <p className="mb-2"><strong>3.2 Non-Disclosure.</strong> Not disclose, publish, transmit, or otherwise make Confidential Information available to any third party without prior written permission from the Disclosing Party (or Company if Company is the Disclosing Party).</p>
            <p className="mb-2"><strong>3.3 Care Standard.</strong> Protect Confidential Information using at least reasonable care, and in any event no less than the care you use to protect your own confidential information of similar importance.</p>
            <p className="mb-2"><strong>3.4 No Misuse / No Competition Copying.</strong> Not use Confidential Information to: build, copy, or assist in building a competing product/service; reverse engineer or replicate another user&apos;s idea or proprietary approach; file IP (patents, trademarks, designs) based on another party&apos;s Confidential Information; solicit the Disclosing Party&apos;s customers, partners, or employees using Confidential Information.</p>
            <p><strong>3.5 No Public Sharing.</strong> Not post Confidential Information on social media, public forums, blogs, app stores, press, or public repositories (e.g., GitHub) unless the Disclosing Party has clearly made it public.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">4) Permitted Disclosures</h2>
            <p className="mb-2">You may disclose Confidential Information only if:</p>
            <p className="mb-2"><strong>4.1 Authorized Representatives.</strong> Disclosure is to your employees/contractors/advisors who have a legitimate need to know for the Purpose and are bound by confidentiality obligations at least as protective as this Agreement. You remain responsible for their compliance.</p>
            <p><strong>4.2 Legal Requirement.</strong> You are required by law, regulation, or valid court order to disclose it, provided you (to the extent legally permitted) give prompt notice to the Disclosing Party and reasonably cooperate to seek confidential treatment or limit disclosure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">5) Exclusions (Not Confidential)</h2>
            <p className="mb-2">
              Confidential Information does not include information that you can demonstrate with written records: (a) is or becomes publicly available through no breach of this Agreement; (b) you lawfully knew before accessing it on the Platform; (c) you independently developed without use of or reference to the Confidential Information; (d) you receive lawfully from a third party without confidentiality restrictions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">6) Ownership, IP, and No License</h2>
            <p className="mb-2"><strong>6.1 Ownership.</strong> All Confidential Information remains the property of the Disclosing Party.</p>
            <p className="mb-2"><strong>6.2 No License.</strong> Nothing in this Agreement grants you any license or rights to Confidential Information except the limited right to use it for the Purpose.</p>
            <p><strong>6.3 User Content Rights.</strong> As between users, each user retains ownership of their own User Content, subject to any platform terms you separately accept.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">7) Data Security and Platform Conduct</h2>
            <p className="mb-2"><strong>7.1 Account Security.</strong> You will keep your account credentials secure and not share your login.</p>
            <p className="mb-2"><strong>7.2 No Circumvention.</strong> You will not attempt to bypass access controls, scrape private content, or use automation to collect Confidential Information at scale.</p>
            <p><strong>7.3 No Recording / Screenshots (Optional Clause).</strong> If enabled by Company settings or a workspace policy, you agree not to take screenshots, screen recordings, exports, or copies of designated confidential areas except as explicitly allowed.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">8) Term and Duration</h2>
            <p className="mb-2"><strong>8.1 Term.</strong> This Agreement applies from the Effective Date and continues while you have access to the Platform.</p>
            <p><strong>8.2 Survival.</strong> Your confidentiality obligations continue for 3–5 years after your last access to Confidential Information, except for trade secrets, which must be protected as long as they remain trade secrets under applicable law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">9) Return / Destruction</h2>
            <p>
              Upon request by the Disclosing Party or Company, you will promptly delete or destroy all copies of Confidential Information in your possession or control, including notes and derivatives, except where retention is required by law (in which case you will keep it secure and confidential).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">10) Feedback (Optional)</h2>
            <p>
              If you provide suggestions, comments, or feedback about the Platform (&quot;Feedback&quot;), you agree Company may use it without restriction or compensation, provided Company does not publicly attribute Feedback to you without consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">11) Injunctive Relief</h2>
            <p>
              You acknowledge that unauthorized disclosure or misuse may cause irreparable harm. The Disclosing Party (and/or Company, as applicable) may seek immediate injunctive or equitable relief in addition to any other legal remedies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">12) Disclaimers</h2>
            <p>
              Confidential Information is provided &quot;as is.&quot; The Disclosing Party makes no warranties regarding accuracy or completeness. Nothing here obligates any party to proceed with any transaction, partnership, or business relationship.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">13) Governing Law and Dispute Resolution</h2>
            <p className="mb-2"><strong>Governing Law:</strong> This Agreement is governed by the laws of the jurisdiction of the Company, excluding conflict of laws rules.</p>
            <p><strong>Disputes:</strong> Any dispute arising out of this Agreement will be resolved in the courts of competent jurisdiction or by arbitration as agreed by the parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">14) Miscellaneous</h2>
            <p className="mb-2"><strong>14.1 Entire Agreement.</strong> This Agreement is the entire confidentiality agreement regarding the Purpose and supersedes prior discussions on this topic.</p>
            <p className="mb-2"><strong>14.2 Severability.</strong> If any provision is unenforceable, the rest remains effective, and the invalid provision is modified to the minimum extent necessary to be enforceable.</p>
            <p className="mb-2"><strong>14.3 Assignment.</strong> You may not assign this Agreement without Company&apos;s written consent. Company may assign it in connection with a merger, acquisition, or sale of assets.</p>
            <p className="mb-2"><strong>14.4 No Waiver.</strong> Failure to enforce any provision is not a waiver of future enforcement.</p>
            <p><strong>14.5 Electronic Acceptance.</strong> Clicking &quot;I Agree,&quot; creating an account, or using the Platform constitutes electronic signature and acceptance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-text-primary mb-3">15) How to Contact Us</h2>
            <p>
              Questions about confidentiality or reporting misuse: chanchito.app.org@gmail.com
            </p>
          </section>

          <p className="mt-8 p-4 bg-gray-50 border border-border-color rounded-lg font-medium text-text-primary">
            BY CLICKING &quot;I AGREE&quot; (OR USING THE PLATFORM), YOU CONFIRM YOU HAVE READ, UNDERSTOOD, AND AGREE TO THIS CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT.
          </p>
        </div>

        <div className="mt-12">
          <Link
            href={`/${locale}/terms`}
            className="text-primary-accent hover:text-accent-alt underline text-sm"
          >
            ← Back to Terms and Conditions
          </Link>
        </div>
      </div>
    </div>
  )
}
