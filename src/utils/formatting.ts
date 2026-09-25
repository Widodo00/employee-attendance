export const Formatting = {
  profileName: function (value: string) {
    const valueSplit = value?.split(" ");
    if (valueSplit?.length >= 2) {
      return valueSplit[0][0]?.toUpperCase() + valueSplit[1][0]?.toUpperCase();
    } else {
      return valueSplit[0][0]?.toUpperCase();
    }
  },
};
