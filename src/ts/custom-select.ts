import TomSelect from 'tom-select';
import { TomOption } from 'tom-select/dist/types/types';
import { getIso2Code } from './iso-countries';

//  returns a TOM Select plugin array from a string of comma separated plugin names
const getPluginsFromOptions = (options: string): Array<string> => {
  if (options === undefined || options?.trim() === '') return [];
  const availablePlugins = [
    'remove_button',
    'dropdown_input',
    'caret_position',
    'checkbox_options',
    'change_listener',
    'clear_button',
    'dropdown_input',
    'input_autogrow',
    'no_active_items',
    'no_backspace_delete',
    'optgroup_columns',
    'restore_on_backspace',
    'virtual_scroll',
  ];
  const optionsArr = options
    ?.replace(' ', '')
    .split(',')
    .filter((option) => availablePlugins.includes(option));
  return optionsArr;
};

// renders the country dropdown option as an svg image and text. The images are gotten from the assets/img/flags folder
function renderCountryOption(data: TomOption) {
  const optionValue = data.$option ? data.$option.value : data.value;
  const image = getIso2Code(optionValue)
    ? `<img class="flag flag-w16" src="/assets/img/flags/${getIso2Code(
        optionValue
      )}.svg" /> &nbsp;`
    : '';

  return `<div class="option">
  ${image}
    <span class="name">${data.text}</span>
  </div>`;
}

// buildCustomSelect builds a custom select dropdown, using the TOM Select library
// for special cases like the country dropdown, include data-country in the select tag
export default function buildCustomSelect(select: HTMLSelectElement) {
  const enableCreate = select.hasAttribute('data-enable-create') ? true : false;
  const optionsObj = select.hasAttribute('data-options')
    ? JSON.parse(select.getAttribute('data-options'))
    : {};

  if (select.hasAttribute('data-filter')) {
    select.classList.add('ts-filter');
  }

  const defaultSettings: TomOption = {
    maxOptions: null,
    create: enableCreate,
    plugins: getPluginsFromOptions(select.getAttribute('data-plugins')),
    hidePlaceholder: true,
  };

  let countrySettings: TomOption = select.hasAttribute('data-country')
    ? {
        maxOptions: null,
        render: {
          option: renderCountryOption,
          item: renderCountryOption,
        },
      }
    : {};

  new TomSelect(select, {
    ...defaultSettings,
    ...countrySettings,
    ...optionsObj,
  });
}