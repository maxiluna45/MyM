import { useState } from 'react';
import CustomAlert from '../components/CustomAlert';
import CustomPrompt from '../components/CustomPrompt';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface PromptButton {
  text: string;
  onPress?: (text: string) => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function useCustomAlert() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({ title: '', message: '', buttons: [] });

  const [promptVisible, setPromptVisible] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    title: string;
    message: string;
    placeholder: string;
    defaultValue: string;
    buttons: PromptButton[];
  }>({ title: '', message: '', placeholder: '', defaultValue: '', buttons: [] });

  const alert = (title: string, message: string, buttons: AlertButton[]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const prompt = (
    title: string,
    message: string,
    buttons: PromptButton[],
    placeholder: string = '',
    defaultValue: string = ''
  ) => {
    setPromptConfig({ title, message, placeholder, defaultValue, buttons });
    setPromptVisible(true);
  };

  const AlertComponent = () => (
    <CustomAlert
      visible={alertVisible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onClose={() => setAlertVisible(false)}
    />
  );

  const PromptComponent = () => (
    <CustomPrompt
      visible={promptVisible}
      title={promptConfig.title}
      message={promptConfig.message}
      placeholder={promptConfig.placeholder}
      defaultValue={promptConfig.defaultValue}
      buttons={promptConfig.buttons}
      onClose={() => setPromptVisible(false)}
    />
  );

  return {
    alert,
    prompt,
    AlertComponent,
    PromptComponent,
  };
}
