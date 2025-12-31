import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '@shared/ui/card/card';

interface FAQItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'brew-faq',
  standalone: true,
  imports: [Card],
  template: `
    <div class="page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1>FAQ</h1>
        <p class="subtitle">Frequently asked questions</p>
      </header>

      <div class="faq-list">
        @for (item of faqs; track item.question) {
          <brew-card class="faq-item">
            <h3 class="faq-question">{{ item.question }}</h3>
            <p class="faq-answer">{{ item.answer }}</p>
          </brew-card>
        }
      </div>
    </div>
  `,
  styles: `
    .page {
      max-width: 700px;
      margin: 0 auto;
      animation: fadeIn var(--duration-normal) var(--ease-out);
    }

    .page-header {
      margin-bottom: var(--space-6);

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-tertiary);
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        margin-bottom: var(--space-3);

        &:hover { color: var(--text-primary); }
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0 0 var(--space-2);
      }

      .subtitle {
        color: var(--text-tertiary);
        margin: 0;
      }
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .faq-question {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      margin: 0 0 var(--space-3);
      color: var(--text-primary);
    }

    .faq-answer {
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      margin: 0;
    }
  `,
})
export class FAQ {
  private router = inject(Router);

  faqs: FAQItem[] = [
    {
      question: 'What is BrewPrint?',
      answer: 'BrewPrint is a precision coffee tracking app designed for enthusiasts who want to record, analyze, and improve their brewing. Track your beans, equipment, brew methods, and dial in your perfect cup.',
    },
    {
      question: 'How do I log a brew?',
      answer: 'Tap the "Log Brew" button from the dashboard or navigate to Brews and tap the + button. Select your beans, equipment, and optionally a saved brew method. Enter your parameters (coffee dose, water, ratio, etc.), rate your brew, and save.',
    },
    {
      question: 'What are brew methods?',
      answer: 'Brew methods are saved recipes with your preferred parameters. Create a method once, then quickly apply it to new brews. You can also save a brew\'s parameters as a new method directly from the brew log form.',
    },
    {
      question: 'How does the streak work?',
      answer: 'Your streak counts consecutive days with at least one logged brew. Log a brew today to keep your streak going! The dashboard shows your current and longest streaks.',
    },
    {
      question: 'Can I track multiple beans in one brew?',
      answer: 'Yes! When logging a brew, you can select multiple beans. This is useful for blends or when experimenting with mixing origins.',
    },
    {
      question: 'How is the rating system?',
      answer: 'Brews are rated on a 5-star scale with half-star precision (0.5 to 5). This helps you track which combinations and parameters produce your best cups.',
    },
    {
      question: 'Can I edit or delete entries?',
      answer: 'Yes. Open any bean, equipment, method, or brew log and use the Edit or Delete buttons. Changes are saved immediately.',
    },
    {
      question: 'Is my data backed up?',
      answer: 'All data is stored securely in Firebase and syncs across your devices when signed in. Your data persists as long as your account exists.',
    },
    {
      question: 'How do I change my password or email?',
      answer: 'Go to Profile → Settings. You\'ll find options to update your display name, email, and password under their respective sections.',
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes. Go to Profile and scroll to the bottom. Tap "Delete Account" and confirm with your password. This action is permanent and cannot be undone.',
    },
  ];

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
