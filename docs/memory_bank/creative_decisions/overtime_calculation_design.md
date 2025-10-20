# Overtime Calculation System - Design Document

## Overview

This document records the creative design process for the Overtime Calculation System, a critical component of the About Time application. The system calculates overtime hours based on configurable settings and is essential for accurate time tracking and balance management.

## Design Process

### Problem Definition

The Overtime Calculation System needed to:

1. Support two calculation methods: Per Day OR Per Week
2. Allow configurable threshold hours before overtime applies
3. Support configurable overtime multipliers (1x, 1.5x, 2x)
4. Handle different payout methods (Paycheck or TOIL)
5. Calculate overtime based on settings active at time of entry creation
6. Display calculations in the UI before submission
7. Support potential future extensions (multiple tiers, etc.)

### Explored Options

#### Option 1: Embedded Calculation in TimeclockEntry Model

**Approach:** Implement calculation logic directly in the TimeclockEntry model.

**Pros:**

- Simple implementation with minimal architecture
- Direct access to all entry data needed for calculation
- Easy to understand code flow
- No additional database tables or services

**Cons:**

- Business logic mixed with data model
- Harder to test in isolation
- More difficult to modify calculation methods
- Code duplication for preview calculations in frontend
- Challenging to extend for future requirements

#### Option 2: Service-Based OT Calculator

**Approach:** Create a dedicated OTCalculatorService separate from models.

**Pros:**

- Clean separation of concerns
- Highly testable with various input scenarios
- Can be used for both actual calculation and preview
- Easier to extend with new calculation methods
- Same code can be used for both backend and frontend (via API)

**Cons:**

- More complex architecture
- Additional layer of abstraction
- Requires careful design of service interfaces
- May need additional mechanism to track which settings were used

#### Option 3: Rules Engine Approach

**Approach:** Implement a rules engine with configurable calculation rules.

**Pros:**

- Highly flexible and extensible
- Rules can be changed without code modification
- Complete separation of business logic from code
- Supports complex rule combinations
- Built for future extension

**Cons:**

- Significant complexity for MVP requirements
- Steeper learning curve for developers
- Performance overhead of rule evaluation
- Requires more upfront design
- May be overkill for current requirements

## Selected Approach

After evaluating the options, we selected **Option 2: Service-Based OT Calculator** as the best approach. This decision was based on several key factors:

1. **Separation of Concerns:** The service approach separates business logic from data models, making the code more maintainable.

2. **Testability:** A service-based approach is easier to test with various scenarios without requiring database operations.

3. **Reusability:** The same calculation service can be used for both backend calculations and frontend previews.

4. **Extensibility:** The service pattern makes it easier to extend or modify calculation methods in the future.

5. **Balanced Complexity:** This option provides good architecture without over-engineering the solution for MVP requirements.

## Implementation Design

### OT Calculator Service

```python
class OTCalculatorService:
    def calculate_ot_hours(self, hours_worked, start_date, end_date, settings=None):
        """
        Calculate overtime hours based on settings

        Args:
            hours_worked: Total hours worked
            start_date: Start date of work period
            end_date: End date of work period
            settings: OT settings to use (or use current if None)

        Returns:
            Tuple of (regular_hours, ot_hours)
        """
        # Use provided settings or get current system settings
        settings = settings or SystemSettings.get_current()

        if settings.ot_calculation_method == 'PER_DAY':
            return self._calculate_daily_ot(hours_worked, settings)
        elif settings.ot_calculation_method == 'PER_WEEK':
            return self._calculate_weekly_ot(hours_worked, start_date, end_date, settings)

    def _calculate_daily_ot(self, hours_worked, settings):
        """Calculate OT based on daily threshold"""
        if hours_worked <= settings.ot_threshold_hours:
            return hours_worked, 0
        else:
            regular_hours = settings.ot_threshold_hours
            ot_hours = hours_worked - regular_hours
            return regular_hours, ot_hours

    def _calculate_weekly_ot(self, hours_worked, start_date, end_date, settings):
        """Calculate OT based on weekly threshold"""
        # Implementation details for weekly calculation
        # This would need to fetch all entries in the week
        pass
```

### Settings Snapshot in TimeclockEntry

To ensure that we preserve the settings used for calculation (as required by the PRD), we'll store a snapshot of the relevant settings in each TimeclockEntry:

```python
class TimeclockEntry(models.Model):
    # ... existing fields ...

    # Snapshot of OT settings at creation time
    ot_calculation_method = models.CharField(max_length=10)
    ot_threshold_hours = models.DecimalField(max_digits=5, decimal_places=2)
    ot_multiplier = models.DecimalField(max_digits=3, decimal_places=1)

    def save(self, *args, **kwargs):
        # On first save, snapshot the current OT settings
        if not self.id:
            settings = SystemSettings.get_current()
            self.ot_calculation_method = settings.ot_calculation_method
            self.ot_threshold_hours = settings.ot_threshold_hours
            self.ot_multiplier = settings.ot_multiplier

            # Calculate OT hours
            calculator = OTCalculatorService()
            hours_worked = self.calculate_hours_worked()
            regular_hours, ot_hours = calculator.calculate_ot_hours(
                hours_worked,
                self.entry_date,
                self.entry_date,
                settings
            )
            self.total_hours = hours_worked
            self.ot_hours = ot_hours

        super().save(*args, **kwargs)
```

### Frontend Preview API

To support the requirement of displaying OT calculations before submission, we'll create a dedicated API endpoint:

```python
class OTPreviewView(APIView):
    def post(self, request):
        # Extract entry data from request
        hours_worked = request.data.get('hours_worked')
        entry_date = request.data.get('entry_date')

        # Calculate OT preview
        calculator = OTCalculatorService()
        regular_hours, ot_hours = calculator.calculate_ot_hours(
            hours_worked, entry_date, entry_date)

        return Response({
            'regular_hours': regular_hours,
            'ot_hours': ot_hours,
            'total_hours': hours_worked,
        })
```

### Weekly OT Calculation Helper

For weekly OT calculations, we'll need additional logic to handle week boundaries:

```python
def get_week_entries(employee_id, date, settings):
    """Get all entries for the employee in the same week as date"""
    # Determine week start based on settings.ot_week_start_day
    week_start_day = settings.ot_week_start_day  # 0=Monday in our system

    # Calculate the start and end of the week containing date
    date_obj = datetime.strptime(date, '%Y-%m-%d')
    days_since_week_start = (date_obj.weekday() - week_start_day) % 7
    week_start = date_obj - timedelta(days=days_since_week_start)
    week_end = week_start + timedelta(days=6)

    # Get all entries in that week
    return TimeclockEntry.objects.filter(
        employee_id=employee_id,
        entry_date__gte=week_start,
        entry_date__lte=week_end
    )
```

### Testing Strategy

A comprehensive testing strategy is crucial for this business-critical component:

```python
class OTCalculationTests(TestCase):
    def setUp(self):
        self.calculator = OTCalculatorService()
        self.settings = SystemSettings(
            ot_calculation_method='PER_DAY',
            ot_threshold_hours=8,
            ot_multiplier=1.5
        )

    def test_daily_no_overtime(self):
        regular, ot = self.calculator._calculate_daily_ot(7, self.settings)
        self.assertEqual(regular, 7)
        self.assertEqual(ot, 0)

    def test_daily_with_overtime(self):
        regular, ot = self.calculator._calculate_daily_ot(10, self.settings)
        self.assertEqual(regular, 8)
        self.assertEqual(ot, 2)

    # Additional test cases for weekly calculation, edge cases, etc.
```

## Implementation Considerations

### Weekly Calculation Complexity

The weekly calculation method introduces additional complexity:

1. Need to consider all entries within the same week
2. Week start day is configurable (settings.ot_week_start_day)
3. Entries might span multiple days within the week
4. Need to handle incomplete weeks (e.g., employee started mid-week)

### Edge Cases

Several edge cases must be handled:

1. **Multiple entries on same day:** Sum hours before calculating OT
2. **Zero hours entries:** Handle correctly without error
3. **Negative hours:** Should be prevented by validation
4. **Settings changes mid-week:** Use snapshot approach to ensure consistent calculation

## Future Extensibility

While the current design meets MVP requirements, it's structured to support future enhancements:

1. **Multiple OT tiers:** Could be implemented by extending the calculator service
2. **Custom rules per employee:** Could add employee_id parameter to service methods
3. **Holiday/weekend special rates:** Could add special day detection to calculation logic

## Conclusion

The service-based OT calculator design provides a clean, maintainable, and testable solution that meets all requirements without unnecessary complexity. By separating the calculation logic from the data model, we ensure both current functionality and future extensibility.
