const validation = {
  labbookName: (input) => {
    const isMatch = !(input.match(/^(?!-)(?!.*--)[a-z0-9-]+(?!-)$/) === null);

    return isMatch;
  },

  labookNameSend: (input) => {
    const isMatch = !(input.match(/^(?!-)(?!.*--)[a-z0-9-]+(?!-)$/) === null) && !input.endsWith('-');

    return isMatch;
  },
};

export default validation;
