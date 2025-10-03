import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface CustomPromptProps {
  visible: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  buttons: {
    text: string;
    onPress?: (text: string) => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose: () => void;
}

export default function CustomPrompt({
  visible,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  buttons,
  onClose,
}: CustomPromptProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleButtonPress = (button: { text: string; onPress?: (text: string) => void }) => {
    if (button.onPress) {
      button.onPress(inputValue);
    }
    setInputValue('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.overlay}>
          <View style={styles.promptContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.message}>{message}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus={true}
                multiline={false}
                returnKeyType="done"
                onSubmitEditing={() => {
                  const confirmButton = buttons.find((b) => b.style !== 'cancel');
                  if (confirmButton && confirmButton.onPress) {
                    confirmButton.onPress(inputValue);
                    setInputValue('');
                    onClose();
                  }
                }}
              />
            </View>

            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                  ]}
                  onPress={() => handleButtonPress(button)}>
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                    ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxWidth: width * 0.8,
    minWidth: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  message: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f3f4f6',
  },
  cancelButton: {
    backgroundColor: '#f9fafb',
  },
  destructiveButton: {
    backgroundColor: '#fef2f2',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B38A0',
  },
  cancelButtonText: {
    color: '#6b7280',
  },
  destructiveButtonText: {
    color: '#dc2626',
  },
});
