import { Setting } from '@bcpros/lixi-models';
import {
  getSelectedAccount,
  settingApi,
  updateSeedBackupTime,
  useSliceDispatch as useLixiSliceDispatch,
  useSliceSelector as useLixiSliceSelector
} from '@bcpros/redux-store';
import _ from 'lodash';
import { createContext, useEffect, useMemo, useState } from 'react';

export interface SettingContextType {
  setting: Setting | null; // or `Setting | undefined` depending on your preference
  allSettings: Record<string, Setting>;
  setSetting: React.Dispatch<React.SetStateAction<Setting | null>>; // SetState function type
}

// Create the Context
export const SettingContext = createContext<SettingContextType>(undefined);

export function SettingProvider({ children }) {
  const dispatch = useLixiSliceDispatch();
  const selectedAccount = useLixiSliceSelector(getSelectedAccount);
  const [setting, setSetting] = useState<Setting>(null);
  const [allSettings, setAllSettings] = useState<{
    id: Setting;
  }>(null);
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('Authorization'));

  const { getSetting, getAllSetting } = settingApi;

  const contextValue = useMemo(() => {
    return { setting, setSetting, allSettings };
  }, [setting, allSettings]);

  useEffect(() => {
    if (_.isNil(token)) {
      const maximumAttempts = 10;
      let attempts = 0;

      const interval = setInterval(() => {
        const sessionToken = sessionStorage.getItem('Authorization');
        attempts++;
        if (sessionToken) {
          setToken(sessionToken);
          clearInterval(interval); // stop polling once token is set
        } else if (attempts >= maximumAttempts) {
          console.warn('Max attempts reached, interval cleared without finding token'); // Warning log
          clearInterval(interval); // Clear interval after maximum attempts
        }
      }, 500); // check every 500ms

      return () => clearInterval(interval);
    }
  }, [selectedAccount]);

  useEffect(() => {
    (async () => {
      const settings = await getAllSetting();
      setAllSettings(settings);
    })();
  }, [setting?.usePublicLocalUserName]);

  //get setting
  useEffect(() => {
    if (selectedAccount?.id && token) {
      (async () => {
        const data = (await getSetting(selectedAccount?.id)) as Setting;
        setSetting(data);

        //set backup time on device
        dispatch(updateSeedBackupTime(data?.lastSeedBackupTime?.toString()));
      })();
    }
  }, [selectedAccount?.id, token]);

  return <SettingContext.Provider value={contextValue}>{children}</SettingContext.Provider>;
}
