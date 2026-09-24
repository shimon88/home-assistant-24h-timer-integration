# Shabbat Clock v1.1.0-beta.2 🧪

## 🎛️ New Feature: Enable/Disable Timer Switch

This beta release adds a powerful new optional feature - the ability to enable or disable the timer without changing your schedule!

### ✨ What's New

**Enable/Disable Toggle Switch**
- Add an optional toggle switch to your card to enable/disable the timer
- When disabled, the timer keeps tracking time but won't control your entities
- Perfect for temporary overrides without losing your schedule
- State persists across Home Assistant restarts
- Available in Hebrew and English

### 🎯 How to Use

#### In Your Card
Add this to your Lovelace card configuration:

```yaml
type: custom:shabbat-clock-card
entity: sensor.your_timer
show_enable_switch: true  # Show the toggle switch
```

#### In Automations
Use the new service to control the timer programmatically:

```yaml
service: shabbat_clock.set_enabled
data:
  entity_id: sensor.your_timer
  enabled: false  # Disable timer (or true to enable)
```

**Example Use Cases:**
- Disable timer when on vacation
- Override timer during special occasions
- Integrate with presence detection
- Create "override" buttons in your dashboard

### 📦 Installation

#### Via HACS (Recommended)
1. Go to HACS → Integrations
2. Find **Shabbat Clock**
3. Click ⋮ (three dots) → Redownload
4. Select version: **v1.1.0-beta.2**
5. Click Download
6. Restart Home Assistant

#### Manual Installation
1. Download `shabbat-clock-v1.1.0-beta.2.zip` from this release
2. Extract to `custom_components/shabbat_clock/`
3. Restart Home Assistant

### 🧪 Testing Checklist

Please help test this new feature:

- [ ] Toggle switch appears when `show_enable_switch: true` is set
- [ ] Toggle switch controls timer correctly (enable/disable)
- [ ] Timer stops controlling entities when disabled
- [ ] Timer resumes controlling entities when enabled
- [ ] State persists after Home Assistant restart
- [ ] Service `shabbat_clock.set_enabled` works in automations
- [ ] All existing timer functionality still works correctly
- [ ] No errors in Home Assistant logs

### 📝 Full Changelog

**Added:**
- 🎛️ Optional enable/disable toggle switch in card
- 🔧 New service: `shabbat_clock.set_enabled` for automation integration
- 💾 State persistence across restarts
- 🌐 Hebrew and English translations

**Technical Details:**
- Backend: New `enabled` state in coordinator with persistence
- Frontend: New toggle UI with modern styling
- Service: `shabbat_clock.set_enabled` with proper schema validation
- Editor: New checkbox to show/hide the toggle

### ⚠️ Beta Notice

This is a **BETA release** for testing purposes. While thoroughly tested, please:
- Test in a non-production environment first if possible
- Report any issues you encounter
- Provide feedback on the new feature

### 🐛 Found a Bug?

Please report issues here: https://github.com/davidss20/home-assistant-24h-timer-integration/issues

Include:
- Your Home Assistant version
- Steps to reproduce
- Any relevant logs
- Screenshots if applicable

### 🎉 Thank You!

Thank you for testing this beta release and helping make Shabbat Clock better!

---

**Previous Features** (from v1.0.0):
- 24-hour visual timer interface
- Automatic entity control based on time schedule
- Home presence detection integration
- Hebrew and English localization
- Flexible configuration options
- Real-time updates

**Coming Soon:**
- Official v1.1.0 stable release
- Custom icon in Home Assistant (pending Brands approval)
- Additional features based on your feedback!


