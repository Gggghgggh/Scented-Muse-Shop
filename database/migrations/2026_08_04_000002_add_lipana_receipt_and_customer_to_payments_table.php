<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('lipana_receipt_number')->nullable()->after('lipana_checkout_request_id')->index();
            $table->string('lipana_customer_name')->nullable()->after('lipana_receipt_number');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['lipana_receipt_number']);
            $table->dropColumn([
                'lipana_receipt_number',
                'lipana_customer_name',
            ]);
        });
    }
};
