<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->json('size_quantities')->nullable()->after('size_prices');
            $table->json('flash_sale_size_quantities')->nullable()->after('flash_sale_ends_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['size_quantities', 'flash_sale_size_quantities']);
        });
    }
};
