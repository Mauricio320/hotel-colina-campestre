export const ObjectClone = <T>(myOriginal: T): T => {
  if (myOriginal) return JSON.parse(JSON.stringify(myOriginal)) as T;
  return myOriginal as T;
};
