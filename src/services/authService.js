import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function register(user, userRepository) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    return userRepository.create({
        ...user,
        password: hashedPassword,
    });
}

export async function login(email, password, userRepository) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
        throw new Error("Usuário ou senha inválidos");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        throw new Error("Usuário ou senha inválidos");
    }

    return jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}