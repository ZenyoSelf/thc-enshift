export interface User{
    id:number,
    email:string,
    password:string,
    firstName:string,
    lastName:string,
    reset_token:string,
    reset_token_expiry:number,
    created_at:Date,
    updated_at:Date
}