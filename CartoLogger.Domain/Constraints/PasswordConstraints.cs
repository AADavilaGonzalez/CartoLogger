namespace CartoLogger.Domain.Constraints;

public static class PasswordConstraints
{
    public const int minLength = 8; 
    public const int maxLength = 30;

    public static bool IsValidPassword(string password, out string? err)
    {
        if(password.Length < minLength || password.Length > maxLength)
        {
            err = $"password must be between {minLength} and {maxLength}";
            return false;
        }
        if(!(password.Any(char.IsUpper) && password.Any(char.IsLower)))
        {
            err = "password must both uppercase and lowercase letters";
            return false;
        }
        if(!password.Any(char.IsDigit))
        {
            err = "password must contain at least one digit";
            return false;
        }
        err = null;
        return true;
    }

    public static string HashPassword(string password)
    {
        return "";
    }

}
