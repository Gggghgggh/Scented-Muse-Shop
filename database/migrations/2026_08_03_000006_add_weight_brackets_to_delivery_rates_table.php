<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('delivery_rates', function (Blueprint $table) {
            $table->decimal('fee_0_1kg', 10, 2)->default(200)->after('fee_per_kg');
            $table->decimal('fee_1_3kg', 10, 2)->default(300)->after('fee_0_1kg');
            $table->decimal('fee_3_5kg', 10, 2)->default(400)->after('fee_1_3kg');
            $table->decimal('fee_over_5kg', 10, 2)->default(600)->after('fee_3_5kg');
        });
    }

    public function down(): void
    {
        Schema::table('delivery_rates', function (Blueprint $table) {
            $table->dropColumn([
                'fee_0_1kg',
                'fee_1_3kg',
                'fee_3_5kg',
                'fee_over_5kg',
            ]);
        });
    }
};
