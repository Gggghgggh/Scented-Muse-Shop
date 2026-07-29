<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->string('brand')->nullable()->after('description');
            $table->unsignedTinyInteger('discount_percentage')->nullable()->after('price');
            $table->boolean('is_flash_sale')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn(['brand', 'discount_percentage', 'is_flash_sale']);
        });
    }
};
