<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background:#FDF5F0; font-family: Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
        <div style="background:white; border-radius:20px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">

            <div style="background:#E8756A; padding:32px; text-align:center;">
                <h1 style="color:white; margin:0; font-size:26px;">🐾 PawNella</h1>
            </div>

            <div style="padding:32px;">
                <h2 style="color:#4A2C24; font-size:20px; margin:0 0 16px;">
                    Bonjour {{ $utilisateur->prenom }},
                </h2>
                <p style="color:#555; font-size:15px; line-height:1.6; margin:0 0 16px;">
                    Bienvenue sur <strong>PawNella</strong> ! Votre compte a été créé avec succès.
                </p>
                <p style="color:#555; font-size:15px; line-height:1.6; margin:0 0 24px;">
                    Vous pouvez dès maintenant réserver des services et gérer vos animaux.
                </p>

                <p style="color:#888; font-size:14px; line-height:1.6; margin:0;">
                    À très bientôt,<br>
                    — L'équipe PawNella
                </p>
            </div>

            <div style="background:#4A2C24; padding:16px; text-align:center;">
                <p style="color:#f5c5b5; font-size:12px; margin:0;">Pour leur bonheur, pour notre amour.</p>
            </div>

        </div>
    </div>
</body>
</html>