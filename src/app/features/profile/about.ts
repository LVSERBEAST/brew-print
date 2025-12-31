import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '@shared/ui/card/card';
import { APP_VERSION_DISPLAY } from '@shared/constants/constants';

@Component({
  selector: 'brew-about',
  standalone: true,
  imports: [Card],
  template: `
    <div class="page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1>About BrewPrint</h1>
      </header>

      <brew-card class="about-card">
        <div class="logo-section">
          <span class="logo-icon">☕</span>
          <span class="logo-text">BrewPrint</span>
          <span class="version">{{ versionDisplay }}</span>
        </div>

        <div class="content">
          <h2>Your Coffee Journey, Perfected</h2>
          
          <p>
            BrewPrint is the precision coffee tracking app designed for passionate enthusiasts 
            who believe every cup can be better than the last. Whether you're dialing in a new 
            single-origin, experimenting with brew ratios, or simply want to recreate that 
            perfect morning cup, BrewPrint is your companion in the pursuit of coffee excellence.
          </p>

          <h3>Why BrewPrint?</h3>
          
          <p>
            We built BrewPrint because we understand the frustration of brewing an incredible cup, 
            only to forget the exact parameters that made it special. With BrewPrint, every detail 
            is captured — from bean origin and roast date to grind settings, water temperature, 
            and brew time.
          </p>

          <h3>Features</h3>
          
          <ul class="feature-list">
            <li>
              <strong>Comprehensive Brew Logging</strong> — Track every variable that affects your cup
            </li>
            <li>
              <strong>Bean Library</strong> — Catalog your coffee collection with detailed profiles
            </li>
            <li>
              <strong>Equipment Tracking</strong> — Log your gear and its specific settings
            </li>
            <li>
              <strong>Brew Methods</strong> — Save and reuse your perfected recipes
            </li>
            <li>
              <strong>Rating System</strong> — Rate and compare your brews over time
            </li>
            <li>
              <strong>Statistics</strong> — Visualize your brewing patterns and progress
            </li>
          </ul>

          <h3>Our Philosophy</h3>
          
          <p>
            Great coffee isn't an accident — it's the result of attention, iteration, and passion. 
            BrewPrint empowers you to be intentional about your craft, transforming each brew 
            from a routine into an opportunity for discovery.
          </p>

          <p class="closing">
            Here's to your next perfect cup. ☕
          </p>
        </div>
      </brew-card>
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

        &:hover {
          color: var(--text-primary);
        }
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0;
      }
    }

    .about-card {
      overflow: hidden;
    }

    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding-bottom: var(--space-6);
      margin-bottom: var(--space-6);
      border-bottom: 1px solid var(--border-subtle);
    }

    .logo-icon {
      font-size: 4rem;
    }

    .logo-text {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-semibold);
    }

    .version {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .content {
      h2 {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        margin: 0 0 var(--space-4);
        color: var(--color-copper-600);
      }

      h3 {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        margin: var(--space-6) 0 var(--space-3);
      }

      p {
        color: var(--text-secondary);
        line-height: var(--leading-relaxed);
        margin-bottom: var(--space-4);
      }
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-4);

      li {
        position: relative;
        padding-left: var(--space-6);
        margin-bottom: var(--space-3);
        color: var(--text-secondary);
        line-height: var(--leading-relaxed);

        &::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: var(--color-copper-500);
          font-weight: var(--weight-bold);
        }

        strong {
          color: var(--text-primary);
        }
      }
    }

    .closing {
      text-align: center;
      font-style: italic;
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--border-subtle);
    }
  `,
})
export class About {
  private router = inject(Router);
  versionDisplay = APP_VERSION_DISPLAY;

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
