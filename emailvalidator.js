function validateEmail(email) {
    const regex = /^[a-z]+\.\d{2}[a-z]{3}\d{4,5}@vitapstudent\.ac\.in$/i;
    
    const match = regex.test(email);
  
    if (match) {

      const parts = email.split('.');
      const registrationNumber = parts[1].split('@')[0];
      
      return {
        valid: true,
        registrationNumber: registrationNumber,
      };
    }
  

    return {
      valid: false,
      registrationNumber: null,
    };
  }


  module.exports = validateEmail;