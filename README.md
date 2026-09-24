# Shabbat Clock Integration

A custom Home Assistant integration that provides a 24-hour circular timer with automatic entity control, plus a Lovelace card.

> **Fork notice:** This is a fork of [davidss20/home-assistant-24h-timer-integration](https://github.com/davidss20/home-assistant-24h-timer-integration) by David S, maintained by [@shimon88](https://github.com/shimon88) and used under the MIT License. Report issues with this fork here, not on the original repository.
>
> **Rename:** This integration is now **Shabbat Clock** (was Timer 24H). Remove the old instance, add Shabbat Clock, and change dashboard YAML to `custom:shabbat-clock-card`.

## Features

- 24-hour circular timer with 15-minute or 30-minute slots
- Automatic control of lights, switches, fans, climate, covers, media players and `input_boolean`
- Activation conditions from any sensor, combined with OR/AND logic
- Multiple timer instances, each with its own schedule
- Lovelace card installed and registered automatically, with cache busting on every version change
- Multi-language UI with RTL support

## Installation

### HACS (recommended)

1. HACS → three dots (⋮) → **Custom repositories**
2. Repository: `https://github.com/shimon88/home-assistant-24h-timer-integration`, Type: **Integration** → **Add**
3. Search for **Shabbat Clock** → **Download**
4. Restart Home Assistant
5. **Settings → Devices & Services → Add Integration → Shabbat Clock**

### Manual

1. Download the latest [release](https://github.com/shimon88/home-assistant-24h-timer-integration/releases)
2. Copy `custom_components/shabbat_clock` into your `config/custom_components/` directory
3. Restart Home Assistant, then add the integration as above

The Lovelace resource is registered automatically. If the log shows that registration failed, add it manually under `Settings → Dashboards → Resources` with URL `/local/shabbat-clock-card/shabbat-clock-card.js` and type `JavaScript Module`.

## Usage

Add the card from the dashboard editor (**Add Card → Shabbat Clock Card**) and pick the timer entity, or use YAML:

```yaml
type: custom:shabbat-clock-card
entity: sensor.shabbat_clock_lighting
show_title: true
```

The dial is a single ring of consecutive slots, like a mechanical timer: 48 half-hour wedges (00:00, 00:30, 01:00 …) or 96 quarter wedges in the 15-minute view. Tap a wedge to toggle it, press and hold to toggle the whole hour, or swipe across the ring to set a range in one gesture. The first wedge of a swipe decides the direction, so starting on an active wedge clears the ones you drag over. A swipe is saved as one `set_slots` call when you lift your finger. Red marks the current slot.

When activation conditions are not met, the timer neither turns entities on nor off. Entities the timer turned on stay on until the active slot ends. Commands retry at most three times per quarter, so turning an entity off by hand during an active slot is treated as an override until the next quarter.

## Configuration

### Integration options

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Timer name |
| `entities` | list | no | Entities controlled automatically |
| `home_sensors` | list | no | Activation condition sensors |
| `home_logic` | string | no | Condition logic: `OR` or `AND` |
| `slot_resolution` | string | no | Slot interval: `15` or `30` minutes |

### Card options

| Name | Type | Default | Description |
|---|---|---|---|
| `entity` | string | - | Timer entity (required) |
| `show_title` | boolean | `true` | Show the timer name |
Settings can be changed later from **Settings → Devices & Services → Shabbat Clock → Configure**, or from the card editor for activation conditions.

## Services

| Service | Purpose |
|---|---|
| `shabbat_clock.toggle_slot` | Toggle one slot (`hour`, `minute`) |
| `shabbat_clock.toggle_hour` | Toggle every slot in one hour |
| `shabbat_clock.set_slots` | Set several slots at once |
| `shabbat_clock.clear_all` | Clear the whole schedule |
| `shabbat_clock.set_enabled` | Enable or disable entity control |
| `shabbat_clock.set_entity_settings` | Set climate temperature/mode or fan speed used on turn-on |
| `shabbat_clock.set_activation_conditions` | Update `home_sensors` and `home_logic` |
| `shabbat_clock.set_slot_resolution` | Switch between the 15- and 30-minute view |

```yaml
service: shabbat_clock.toggle_slot
data:
  entity_id: sensor.shabbat_clock_lighting
  hour: 14
  minute: 30
```

The timer sensor exposes `time_slots`, `current_slot`, `home_status`, `home_sensors`, `home_logic`, `controlled_entities`, `enabled`, `slot_resolution` and `last_update` as attributes for use in templates and automations.

## Troubleshooting

- **Card does not appear:** check the log for `Shabbat Clock Card resource registered successfully`, then hard refresh the browser (`Ctrl + Shift + R`).
- **Card not updating after an integration update:** make sure the registered resource URL keeps the `?v=` parameter; the integration bumps it on every version.
- **Entities not switching:** confirm the entities are available and the activation conditions are met, then check the Home Assistant log.

## License

MIT — see [LICENSE](LICENSE). Original work Copyright (c) 2024 David S.
