<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BienvenueMail extends Mailable
{
    use Queueable, SerializesModels;

    public $utilisateur;

    public function __construct($utilisateur)
    {
        $this->utilisateur = $utilisateur;
    }

    public function build()
    {
        return $this->subject('Bienvenue sur PawNella ! 🐾')
                    ->view('emails.bienvenue');
    }
}