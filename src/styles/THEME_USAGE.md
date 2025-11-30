# Theme Variables Usage Guide

This guide explains how to use theme variables in your Angular components to support light and dark modes.

## Available Theme Variables

### Background Colors
- `--bg-primary` - Main background color
- `--bg-secondary` - Secondary background (cards, panels)
- `--bg-tertiary` - Tertiary background (hover states)

### Text Colors
- `--text-primary` - Primary text color
- `--text-secondary` - Secondary text color
- `--text-muted` - Muted/disabled text color
- `--text-inverse` - Inverse text (for dark backgrounds)

### Border Colors
- `--border-color` - Standard border color
- `--border-color-light` - Light border color

### Semantic Colors
- `--color-primary` - Primary brand color
- `--color-secondary` - Secondary color
- `--color-success` - Success state color
- `--color-danger` - Danger/error color
- `--color-warning` - Warning color
- `--color-info` - Info color

### Component-Specific Variables
- `--card-bg` - Card background
- `--card-border` - Card border
- `--input-bg` - Input background
- `--input-border` - Input border
- `--input-focus-border` - Input focus border
- `--link-color` - Link color
- `--link-hover-color` - Link hover color

### Shadows
- `--shadow-sm` - Small shadow
- `--shadow-md` - Medium shadow
- `--shadow-lg` - Large shadow

## How to Use in Component SCSS Files

### Basic Usage

Replace hardcoded colors with theme variables:

```scss
// ❌ Before (hardcoded)
.my-component {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #e0e0e0;
}

// ✅ After (theme-aware)
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Complete Component Example

```scss
// my-component.component.scss
.my-component {
  // Backgrounds
  background-color: var(--bg-primary);

  // Text
  color: var(--text-primary);

  // Borders
  border: 1px solid var(--border-color);
  border-radius: 8px;

  // Shadows
  box-shadow: var(--shadow-md);

  // Hover state
  &:hover {
    background-color: var(--bg-secondary);
  }

  // Nested elements
  .title {
    color: var(--text-primary);
    font-weight: bold;
  }

  .description {
    color: var(--text-secondary);
  }

  // Buttons
  .btn-primary {
    background-color: var(--color-primary);
    color: var(--text-inverse);

    &:hover {
      background-color: var(--link-hover-color);
    }
  }

  // Inputs
  input {
    background-color: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--input-border);

    &:focus {
      border-color: var(--input-focus-border);
      outline: none;
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }

  // Cards
  .card {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
  }

  // Links
  a {
    color: var(--link-color);

    &:hover {
      color: var(--link-hover-color);
    }
  }
}
```

### Using Semantic Colors

```scss
.success-message {
  background-color: var(--color-success);
  color: var(--text-inverse);
}

.error-message {
  background-color: var(--color-danger);
  color: var(--text-inverse);
}

.warning-message {
  background-color: var(--color-warning);
  color: var(--text-primary);
}

.info-message {
  background-color: var(--color-info);
  color: var(--text-inverse);
}
```

### Transitions

Always add transitions for smooth theme switching:

```scss
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border-color);

  // Smooth transitions when theme changes
  transition: background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease;
}
```

Or use the global transition in `styles.scss`:

```scss
// Already applied globally in styles.scss
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## Utility Classes

You can also use utility classes defined in `styles.scss`:

```html
<!-- Backgrounds -->
<div class="bg-primary">Primary background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-tertiary">Tertiary background</div>

<!-- Text -->
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>
<p class="text-muted">Muted text</p>

<!-- Borders -->
<div class="border-theme">Themed border</div>

<!-- Cards -->
<div class="card-theme">Themed card</div>

<!-- Inputs -->
<input class="input-theme" type="text" />
```

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Use semantic color variables** (`--color-primary`, `--color-success`, etc.) for UI states
3. **Add transitions** for smooth theme switching
4. **Test in both themes** to ensure readability and contrast
5. **Use `--text-inverse`** for text on colored backgrounds
6. **Avoid opacity on backgrounds** - use theme variables instead

## Common Patterns

### Modal/Dialog
```scss
.modal {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-lg);

  .modal-header {
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
  }

  .modal-body {
    color: var(--text-primary);
  }
}
```

### Dropdown Menu
```scss
.dropdown-menu {
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);

  .dropdown-item {
    color: var(--text-primary);

    &:hover {
      background-color: var(--bg-secondary);
    }
  }
}
```

### Table
```scss
.table {
  background-color: var(--bg-primary);
  color: var(--text-primary);

  th {
    background-color: var(--bg-secondary);
    border-color: var(--border-color);
  }

  td {
    border-color: var(--border-color);
  }

  tr:hover {
    background-color: var(--bg-secondary);
  }
}
```

## Troubleshooting

### Colors not changing?
- Make sure you're using `var(--variable-name)` syntax
- Check that the variable name is correct (case-sensitive)
- Verify the theme classes are applied to `html` or `body` element

### Transitions not smooth?
- Ensure transitions are defined in your component styles
- Check that the global transition in `styles.scss` is applied

### Need a custom color?
- Add it to `_theme-variables.scss`, `_light-theme.scss`, and `_dark-theme.scss`
- Use a descriptive name following the naming convention

