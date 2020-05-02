import validator from 'validator';
import { isEmpty } from './is_empty';

export const validatePasswordInput = (data)=>{
    let errors ={};
   
    
    data.email = !isEmpty(data.email) ? data.email: '';

    
    if (!validator.isEmail(data.email)){
       errors.email = 'Email is invalid';
      }

    

    if(validator.isEmpty(data.email)){
       errors.email = 'Email field is required';
   }


return {
   errors,
   isValid:isEmpty(errors)
}
}