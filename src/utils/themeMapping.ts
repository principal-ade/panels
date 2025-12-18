import { Theme } from '@principal-ade/industry-theme';

/**
 * Maps industry-theme Theme object to panel-specific CSS variables
 */
export function mapThemeToPanelVars(theme: Theme): Record<string, string> {
  return {
    '--panel-background': theme.colors.background,
    '--panel-border': theme.colors.border,
    '--panel-handle': theme.colors.backgroundSecondary,
    '--panel-handle-hover': theme.colors.backgroundHover,
    '--panel-handle-active': theme.colors.primary,
    '--panel-button-bg': theme.colors.surface,
    '--panel-button-hover': theme.colors.backgroundHover,
    '--panel-button-border': theme.colors.border,
    '--panel-button-icon': theme.colors.textSecondary,
    '--panel-accent-bg': theme.colors.primary + '15', // primary color with 15% opacity
  };
}

/**
 * Maps industry-theme Theme object to tab-specific CSS variables
 */
export function mapThemeToTabVars(theme: Theme): Record<string, string> {
  return {
    '--tab-list-bg': theme.colors.backgroundSecondary,
    '--tab-border': theme.colors.border,
    '--tab-bg': theme.colors.surface,
    '--tab-bg-hover': theme.colors.backgroundHover,
    '--tab-bg-active': theme.colors.primary,
    '--tab-text': theme.colors.text,
    '--tab-text-active': theme.colors.background,
    '--tab-border-hover': theme.colors.textSecondary,
    '--tab-border-active': theme.colors.primary,
    '--tab-focus': theme.colors.primary,
    '--tab-content-bg': theme.colors.background,
    '--tab-empty-text': theme.colors.textMuted,
    '--tab-font-family': theme.fonts.body,
    '--tab-font-size': `${theme.fontSizes[1]}px`,
    '--tab-font-weight': String(theme.fontWeights.medium),
  };
}
