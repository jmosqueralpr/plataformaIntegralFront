import {useForm} from 'react-hook-form';

/* Componente básico de React */

function RegisterPage() {
    return (
        <div>
            <form action="">
                <input type="text" name="username" />
                <input type="email" name="email"/>
                <input type="password" name="password"/>
            </form>
        </div>
    )
}

export default RegisterPage