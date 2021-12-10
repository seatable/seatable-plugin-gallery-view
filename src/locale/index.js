import intl from 'react-intl-universal';
import pluginContext from '../plugin-context';
import de from './lang/de';
import en from './lang/en';
import fr from './lang/fr';
import zh_CN from './lang/zh_CN';

const LOCALES = {
  'de': de,
  'en': en,
  'fr': fr,
  'zh-cn': zh_CN,
};

const LAUGUAGE = 'zh-cn';

const lang = pluginContext.getSetting('lang') || LAUGUAGE;
intl.init({currentLocale: lang, locales: LOCALES});
