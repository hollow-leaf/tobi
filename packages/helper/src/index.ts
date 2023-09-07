export * from './lighthouse/lighthouse'
export const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time))

export const formatString = (address: string, formatLength: number) => {
  if (!address) {
    return ""; // If the address is undefined, return an empty string
  }
  if (address.length <= formatLength) {
    return address; // If the address is shorter than 12 characters, return it as is
  } else {
    const prefix = address.slice(0, formatLength); // Get the first six characters
    const suffix = address.slice(-formatLength); // Get the last six characters
    return `${prefix}...${suffix}`; // Combine the first six, ..., and last six characters
  }
}
