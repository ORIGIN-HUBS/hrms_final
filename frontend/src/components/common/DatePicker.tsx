import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

interface DatePickerProps {
  label: string;
  value: string;
  onChangeDate: (date: string) => void;
  error?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChangeDate,
  error,
  placeholder = 'Select date',
  minimumDate,
  maximumDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(
    value ? new Date(value) : new Date()
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChangeDate(formattedDate);
    }
  };

  const handleWebDateChange = (event: any) => {
    const dateValue = event.target.value;
    if (dateValue) {
      onChangeDate(dateValue);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputContainer, error && styles.inputError]}>
          <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} style={styles.icon} />
          <input
            type="date"
            value={value}
            onChange={handleWebDateChange}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              padding: '8px',
              backgroundColor: 'transparent',
              color: colors.text,
              fontFamily: 'inherit',
            }}
            min={minimumDate?.toISOString().split('T')[0]}
            max={maximumDate?.toISOString().split('T')[0]}
          />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputContainer, error && styles.inputError]}
        onPress={() => setShowPicker(true)}
      >
        <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} style={styles.icon} />
        <Text style={[styles.dateText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.danger,
  },
  icon: {
    marginRight: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
});
