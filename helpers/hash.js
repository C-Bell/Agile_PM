/* eslint prefer-const: off, no-bitwise: off */
// Disables eslints prefer-const setting for this file.

module.exports = {

/* Hash Code Method (API & Web)
Source:
* http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/;
Input:
* String - Password, performs simple hashing on the password so that passwords
* are not stored in plain text
Output:
* Encrypted String
*/
  hashCode: (unsecureString) => {
    if (!isNaN(unsecureString)) {
      // console.log(`${unsecureString} is already hashed!`);
    } else {
      let hash = 128;
      if (unsecureString.length === 0) return hash;
      for (let i = 0; i < unsecureString.length; i++) {
        let char = unsecureString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash &= hash; // Convert to 32bit integer
      }
      // console.log(`Hashed ${unsecureString} to ${hash}`);
      return hash;
    }
  },
};
