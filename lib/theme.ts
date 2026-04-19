// Tema customizado EvoQuest — tons terrosos/paper sobre Fluent UI v9

import { BrandVariants, createLightTheme, createDarkTheme, Theme } from '@fluentui/react-components';

const evoquestBrand: BrandVariants = {
  10: '#2C1A0A',
  20: '#3D2510',
  30: '#4F3118',
  40: '#623D21',
  50: '#744A2A',
  60: '#8B6F47',
  70: '#A07D52',
  80: '#B8915E',
  90: '#CEA870',
  100: '#D9B882',
  110: '#E3C896',
  120: '#EDD8AC',
  130: '#F4E5C5',
  140: '#F9F0DC',
  150: '#FCF5EA',
  160: '#FAF9F6',
};

export const evoquestLightTheme: Theme = {
  ...createLightTheme(evoquestBrand),
  colorBrandBackground: '#8B6F47',
  colorBrandBackgroundHover: '#A07D52',
  colorBrandBackgroundPressed: '#744A2A',
  colorNeutralBackground1: '#FAF9F6',
  colorNeutralBackground2: '#F4F2EE',
  colorNeutralBackground3: '#EDE9E2',
  colorNeutralForeground1: '#1B1820',
  colorNeutralForeground2: '#4A4450',
  colorNeutralStroke1: '#D5CFC6',
  colorNeutralStroke2: '#E8E3DC',
};

export const evoquestDarkTheme: Theme = {
  ...createDarkTheme(evoquestBrand),
  colorBrandBackground: '#A07D52',
  colorBrandBackgroundHover: '#B8915E',
  colorBrandBackgroundPressed: '#8B6F47',
  colorNeutralBackground1: '#1B1820',
  colorNeutralBackground2: '#251F2B',
  colorNeutralBackground3: '#2F2838',
  colorNeutralForeground1: '#F4E5C5',
  colorNeutralForeground2: '#CFC4B0',
};
