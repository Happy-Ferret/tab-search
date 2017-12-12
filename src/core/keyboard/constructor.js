import {
  CTRL,
  ALT,
  SHIFT,
  META,
} from './constants';
import {
  kbdStringComboRe,
  kbdStringSingleRe,
} from './regex';

// On macs the metaKey is triggered. We want them to be treated equivalently?
// So the value of the ctrlKey property should be (ctrlKey || metaKey
const modifierPropsMap = {
  [CTRL]: 'ctrlKey',
  [ALT]: 'altKey',
  [SHIFT]: 'shiftKey',
  [META]: 'ctrlKey', // Point meta key to ctrl key
};

// const modifiersArray = Object.keys(modifierPropsMap);

const protoKbdCommand = {
  key: null,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
};

// Returns a bool indicating whether this input is valid
export function isValidKbdCommand(input) {
  try {
    kbdCommand(input);
  } catch (e) {
    return false;
  }
  return true;
}

// Accepts a valid command string or
export function kbdCommand(input) {
  if (typeof input === 'string') {
    return kbdCommandString(input);
  } else if (typeof input === 'object' && !Array.isArray(input)) {
    return kbdCommandEvent(input);
  }
  throw new TypeError(
    "Command input isn't the right type. KbdCommand requires a valid command\
    string or object",
  );
}

// Retruns a kbdCommand object. Throws a SyntaxError if the string isn't valid
function kbdCommandString(inputString) {
  const isValidCommandString =
    kbdStringComboRe.test(inputString) || kbdStringSingleRe.test(inputString);
  if (!isValidCommandString) {
    throw new SyntaxError(`${inputString} is not a valid command string!`);
  }
  const stringParts = inputString.split('+');
  return stringParts.reduce((acc, key, index) => {
    if (index === stringParts.length - 1) {
      return Object.assign({}, acc, { key });
    }
    return Object.assign({}, acc, { [modifierPropsMap[key]]: true });
  }, protoKbdCommand);
}

function kbdCommandEvent(event) {
  const command = makeKbdCommandFromEvent(event);
  const isSingleKey = c => !c.ctrlKey && !c.shiftKey && !c.altKey;
  if (isSingleKey(command) && !kbdStringSingleRe.test(command.key)) {
    throw new Error(`${command.key} isn't a valid single key!`);
  }
  return command;
}

function makeKbdCommandFromEvent({
  key,
  ctrlKey,
  metaKey,
  altKey,
  shiftKey,
}) {
  return {
    key: capitalizeFirstLetter(key),
    ctrlKey: ctrlKey || metaKey,
    altKey,
    shiftKey,
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

