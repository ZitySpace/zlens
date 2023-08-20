import React, { useEffect, useState, useRef } from 'react';

type ColorTheme = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
};

const colorThemes: Record<string, ColorTheme> = {
  sunsetBoulevard: {
    primary: 'bg-red-500',
    secondary: 'bg-yellow-400',
    accent: 'bg-pink-500',
    background: 'bg-gray-100',
    text: 'text-gray-900',
  },
  oceanBreeze: {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-300',
    accent: 'bg-indigo-500',
    background: 'bg-gray-100',
    text: 'text-gray-900',
  },
  forestRetreat: {
    primary: 'bg-green-600',
    secondary: 'bg-green-300',
    accent: 'bg-yellow-500',
    background: 'bg-gray-100',
    text: 'text-gray-900',
  },
  arcticChill: {
    primary: 'bg-blue-300',
    secondary: 'bg-blue-700',
    accent: 'bg-purple-600',
    background: 'bg-gray-100',
    text: 'text-gray-900',
  },
  desertMirage: {
    primary: 'bg-yellow-600',
    secondary: 'bg-orange-500',
    accent: 'bg-red-500',
    background: 'bg-gray-100',
    text: 'text-gray-900',
  },
};

const hoverEffects: Record<string, string> = {
  sunsetBoulevard: 'hover:bg-red-400 hover:text-white',
  oceanBreeze: 'hover:bg-blue-400 hover:text-white',
  forestRetreat: 'hover:bg-green-400 hover:text-white',
  arcticChill: 'hover:bg-blue-200 hover:text-white',
  desertMirage: 'hover:bg-yellow-500 hover:text-white',
};

const underlineColors: Record<string, string> = {
  sunsetBoulevard: 'border-red-500',
  oceanBreeze: 'border-blue-500',
  forestRetreat: 'border-green-600',
  arcticChill: 'border-blue-300',
  desertMirage: 'border-yellow-600',
};

const focusedUnderlineColors: Record<string, string> = {
  sunsetBoulevard: 'focus:border-red-700',
  oceanBreeze: 'focus:border-blue-700',
  forestRetreat: 'focus:border-green-800',
  arcticChill: 'focus:border-blue-500',
  desertMirage: 'focus:border-yellow-800',
};

const focusedColors: Record<string, string> = {
  sunsetBoulevard: 'focus:ring-red-500',
  oceanBreeze: 'focus:ring-blue-500',
  forestRetreat: 'focus:ring-green-600',
  arcticChill: 'focus:ring-blue-300',
  desertMirage: 'focus:ring-yellow-600',
};

export const Input = ({
  themeName,
  id,
  name,
  init,
  onChange,
}: {
  themeName: keyof typeof colorThemes;
  id: string;
  name: string;
  init: string;
  onChange?: (value: string) => void;
}) => {
  const underlineColor = underlineColors[themeName];
  const focusedUnderlineColor = focusedUnderlineColors[themeName];

  const [inputValue, setInputValue] = useState(init);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (onChange) onChange(value);
  };

  return (
    <div className='w-full flex flex-col justify-center items-start space-y-1'>
      <label className='text-sm text-gray-500' htmlFor={id}>
        {name}
      </label>
      <input
        className={`w-full py-2 px-3 text-gray-700 leading-tight text-sm focus:outline-none border-b-2 ${underlineColor} ${focusedUnderlineColor}`}
        type='text'
        value={inputValue}
        placeholder={init}
        onChange={handleInputChange}
        id={id}
      />
    </div>
  );
};

export const Toggle = ({
  themeName,
  id,
  name,
  init,
  onToggle,
}: {
  themeName: keyof typeof colorThemes;
  id: string;
  name: string;
  init: boolean;
  onToggle?: (value: boolean) => void;
}) => {
  const [isToggled, setIsToggled] = useState(init);
  const themeColors = colorThemes[themeName];

  const handleToggle = () => {
    setIsToggled(!isToggled);
    if (onToggle) onToggle(!isToggled);
  };

  const bgColorClass = isToggled ? themeColors.primary : themeColors.secondary;

  return (
    <div className='w-full flex flex-col justify-center items-start space-y-1'>
      <span className='text-sm text-gray-500'>{name}</span>
      <div className='flex items-center'>
        <input
          type='checkbox'
          id={id}
          className='hidden'
          checked={isToggled}
          onChange={handleToggle}
        />
        <label
          htmlFor={id}
          className={`${bgColorClass} cursor-pointer w-12 h-6 block rounded-full relative`}
        >
          <span
            className={`mx-1 my-1 ${
              isToggled ? 'translate-x-6' : 'translate-x-0'
            } transform transition-transform duration-300 ease-in-out absolute inset-y-0 left-0 block w-4 h-4 bg-white rounded-full shadow focus:outline-none`}
          />
        </label>
      </div>
    </div>
  );
};

export const Select = ({
  themeName,
  id,
  name,
  init,
  options,
  onSelect,
}: {
  themeName: keyof typeof colorThemes;
  id: string;
  name: string;
  init: string;
  options: string[];
  onSelect?: (value: string) => void;
}) => {
  const [selectedOption, setSelectedOption] = useState(init);
  const [isExpanded, setIsExpanded] = useState(false);
  const themeColors = colorThemes[themeName];

  const handleClick = (option: string) => {
    setSelectedOption(option);
    if (onSelect) onSelect(option);
    setIsExpanded(false);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const optionPanelRef = useRef<HTMLDivElement>(null);

  const handleCloseOptionPanel = (event: MouseEvent) => {
    if (
      optionPanelRef.current &&
      !optionPanelRef.current.contains(event.target as Node)
    )
      setIsExpanded(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleCloseOptionPanel);

    return () => {
      document.removeEventListener('mousedown', handleCloseOptionPanel);
    };
  });

  return (
    <div
      className='w-full flex flex-col justify-center items-start space-y-1'
      ref={optionPanelRef}
    >
      <label className='text-sm text-gray-500' htmlFor={id}>
        {name}
      </label>

      <div className='relative w-full'>
        <div
          className={`w-full flex justify-between items-center px-2 py-1.5 cursor-pointer ${themeColors.primary} ${themeColors.text} border border-gray-200 rounded-md`}
          onClick={toggleExpansion}
        >
          <span className='text-gray-800 text-sm'>{selectedOption}</span>
          <span
            className={`transform transition-transform duration-300 ease-in-out text-gray-700 text-sm ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
          <input className='hidden' value={selectedOption} id={id} readOnly />
        </div>
        {isExpanded && (
          <div className='absolute left-0 w-full mt-2 z-10 rounded-md shadow-md overflow-clip'>
            <ul className='bg-white border border-gray-200 divide-y divide-gray-200'>
              {options.map((option, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer text-sm text-gray-700 ${
                    option === selectedOption
                      ? themeColors.primary + ' ' + themeColors.text
                      : ''
                  } ${hoverEffects[themeName]}`}
                  onClick={() => handleClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const MultiSelect = ({
  themeName,
  id,
  name,
  init,
  options,
  onSelect,
}: {
  themeName: keyof typeof colorThemes;
  id: string;
  name: string;
  init: string[];
  options: string[];
  onSelect?: (value: string[]) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(init);

  const themeColors = colorThemes[themeName];

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClick = (option: string) => {
    let updatedOptions = [...selectedOptions];
    if (selectedOptions.includes(option)) {
      updatedOptions = updatedOptions.filter((item) => item !== option);
    } else {
      updatedOptions.push(option);
    }

    setSelectedOptions(updatedOptions);
    if (onSelect) onSelect(updatedOptions);
  };

  const optionPanelRef = useRef<HTMLDivElement>(null);

  const handleCloseOptionPanel = (event: MouseEvent) => {
    if (
      optionPanelRef.current &&
      !optionPanelRef.current.contains(event.target as Node)
    )
      setIsExpanded(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleCloseOptionPanel);

    return () => {
      document.removeEventListener('mousedown', handleCloseOptionPanel);
    };
  });

  return (
    <div
      className='w-full flex flex-col justify-center items-start space-y-1'
      ref={optionPanelRef}
    >
      <label className='text-sm text-gray-500' htmlFor={id}>
        {name}
      </label>

      <div className='relative w-full'>
        <div
          className={`w-full flex justify-between items-center px-2 py-1.5 cursor-pointer ${themeColors.primary} ${themeColors.text} border border-gray-200 rounded-md`}
          onClick={toggleExpansion}
        >
          <span className='text-gray-700 text-sm'>
            {selectedOptions.join(', ') || 'Select options'}
          </span>
          <span
            className={`transform transition-transform duration-300 ease-in-out text-gray-700 text-sm ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            ▼
          </span>
          <input className='hidden' value={selectedOptions} id={id} readOnly />
        </div>
        {isExpanded && (
          <div className='absolute left-0 w-full mt-2 z-10 rounded-md shadow-md overflow-clip'>
            <ul className='bg-white border border-gray-200 divide-y divide-gray-200'>
              {options.map((option, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer text-sm text-gray-700 ${
                    selectedOptions.includes(option)
                      ? themeColors.primary + ' ' + themeColors.text
                      : ''
                  } ${hoverEffects[themeName]}`}
                  onClick={() => handleClick(option)}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ParamBlock = ({
  name,
  config,
  value,
}: {
  name: string;
  config: {
    type: string;
    default?: unknown;
    [key: string]: unknown;
  };
  value?: unknown;
}) => {
  const init = value ?? config.default ?? undefined;
  const tasks = [
    'classification',
    'multilabel_classification',
    'detection',
    'box_classification',
    'box_multilabel_classification',
    'instance_segmentation',
    'keypoints_detection',
  ];

  if (config.type === 'bool') {
    return (
      <Toggle
        themeName='oceanBreeze'
        id={name}
        name={name}
        init={init as boolean}
      />
    );
  } else if (config.type === 'str') {
    if ('choices' in config)
      return (
        <MultiSelect
          themeName='oceanBreeze'
          id={name}
          name={name}
          init={(init as string).replace(' ', '').split(',')}
          options={
            config.choices === 'all'
              ? tasks
              : (config.choices as string).replace(' ', '').split(',')
          }
        />
      );
    else
      return (
        <Input
          themeName='oceanBreeze'
          id={name}
          name={name}
          init={init as string}
        />
      );
  } else return <></>;
};

export default ParamBlock;
