<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            $table->string('whatsapp_url')->nullable()->after('whatsapp_number');
            $table->string('tiktok_url')->nullable()->after('whatsapp_url');
            $table->string('facebook_url')->nullable()->after('tiktok_url');
        });
    }

    public function down(): void
    {
        Schema::table('shop_settings', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_url', 'tiktok_url', 'facebook_url']);
        });
    }
};
