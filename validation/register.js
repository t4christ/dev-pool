 import validator from 'validator';
 import { isEmpty } from './is_empty';

 export const validateRegisterInput = (data)=>{
     let errors ={};
     data.name = !isEmpty(data.name) ? data.name: '';
     data.email = !isEmpty(data.email) ? data.email: '';
     data.password = !isEmpty(data.password) ? data.password: '';
     data.c_password = !isEmpty(data.c_password) ? data.c_password: '';
      


     if (!validator.isLength(data.name,{min:2, max:30})){
      errors.name = 'Name must be between 2 and 30 characters';
     }

     if (!validator.isEmail(data.email)){
        errors.email = 'Email is invalid';
       }

       if (!validator.isLength(data.password,{min:6,max:30})){
        errors.password = 'Password must be at least 6 characters';
       }

       if (!validator.equals(data.password,data.c_password)){
        errors.c_password = 'Passwords must match';
       }

     if(validator.isEmpty(data.name)){
         errors.name = 'Name field is required';
     }

     if(validator.isEmpty(data.email)){
        errors.email = 'Email field is required';
    }

    if(validator.isEmpty(data.c_password)){
        errors.c_password = 'Confirmation Password field is required';
    }

    if(validator.isEmpty(data.password)){
        errors.password = 'Password field is required';
    }

   


return {
    errors,
    isValid:isEmpty(errors)
}
 }