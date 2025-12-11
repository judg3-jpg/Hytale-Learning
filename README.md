# Moderation Dashboard

A modern, responsive UI system for user moderation that displays user models inside styled UI boxes.

## Features

### User Model
The `UserModel` class represents users in the moderation system with the following properties:

- **Identity**: id, username, email, displayName, avatar
- **Status**: active, warned, muted, banned
- **Risk Assessment**: riskLevel, riskScore (0-100)
- **Statistics**: posts, reports, warnings
- **Activity**: activityLog, flags, notes
- **Timestamps**: createdAt, lastActive

### UI Components

#### User Cards
Each user is displayed in a styled card showing:
- Avatar with initials
- Name, email, and user ID
- Status badge (color-coded)
- Risk indicator bar
- Quick stats (posts, reports, warnings)
- Action buttons (View, Warn, Ban)

#### User Detail Modal
Clicking a user card opens a detailed modal with:
- Complete user information
- Full risk assessment
- Activity log history
- Moderation action buttons

#### Search & Filters
- Text search by name, email, or ID
- Filter by status (Active, Warned, Muted, Banned)
- Filter by risk level (Low, Medium, High)

### Moderation Actions
- **Warn**: Issue a warning to the user
- **Mute**: Temporarily silence the user
- **Unmute**: Remove mute from user
- **Ban**: Permanently ban the user
- **Unban**: Remove ban from user

## Usage

### Running Locally

Simply open `index.html` in a web browser:

```bash
# Using Python's built-in server
python3 -m http.server 8080

# Or using Node.js http-server
npx http-server -p 8080
```

Then navigate to `http://localhost:8080`

### Using the User Model in Code

```javascript
// Create a new user
const user = new UserModel({
    username: 'new_user',
    email: 'user@example.com',
    displayName: 'New User',
    status: 'active',
    riskScore: 20
});

// Get user initials for avatar
user.getInitials(); // Returns "NU"

// Get risk class for styling
user.getRiskClass(); // Returns "low", "medium", or "high"

// Add activity to log
user.addActivity('Account reviewed', 'Manual review completed');

// Export user data
const userData = user.toJSON();
```

### Customizing the System

#### Adding New Users
```javascript
const newUser = new UserModel({
    username: 'custom_user',
    email: 'custom@example.com',
    displayName: 'Custom User',
    status: 'active',
    riskScore: 30,
    posts: 50,
    reports: 0,
    warnings: 0
});

moderationSystem.users.push(newUser);
moderationSystem.renderUsers();
```

#### Customizing Theme Colors
Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    /* ... more variables */
}
```

## File Structure

```
/
├── index.html      # Main HTML structure
├── styles.css      # Styling and theming
├── app.js          # User model and moderation logic
└── README.md       # Documentation
```

## Browser Support

Works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT License
