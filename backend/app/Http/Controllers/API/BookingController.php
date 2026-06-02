<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Poli;
use App\Models\Schedule;
use App\Services\FirebaseQueueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            // Ubah 'integer' menjadi 'string'
            'patient_id' => 'required|string|exists:patients,id', 
            'schedule_id' => 'required|integer|exists:schedules,id',
            'tanggal'     => 'required|date',
        ]);

        $schedule = Schedule::findOrFail($request->schedule_id);
        $poli = Poli::findOrFail($schedule->poli_id);

        $lastBooking = Booking::whereDate('tanggal', $request->tanggal)
            ->whereHas('schedule', function ($q) use ($schedule) {
                $q->where('poli_id', $schedule->poli_id);
            })
            ->latest()
            ->first();

        $nextNumber = 1;
        if ($lastBooking) {
            $lastNumber = intval(substr($lastBooking->nomor_antrean, strlen($poli->kode_poli)));
            $nextNumber = $lastNumber + 1;
        }

        $nomorAntrean = $poli->kode_poli . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);

        $booking = Booking::create([
            'patient_id'    => $request->patient_id,
            'schedule_id'   => $request->schedule_id,
            'tanggal'       => $request->tanggal,
            'nomor_antrean' => $nomorAntrean,
            'status'        => 'waiting',
        ]);

        return response()->json([
            'success' => true,
            'data'    => Booking::with(['patient', 'schedule.doctor', 'schedule.poli'])
                ->find($booking->id),
        ]);
    }

    public function show($id)
    {
        $booking = Booking::with(['patient', 'schedule.doctor', 'schedule.poli'])
            ->findOrFail($id);
        return response()->json($booking);
    }

    public function queues(Request $request)
    {
        $query = Booking::with(['patient', 'schedule.doctor', 'schedule.poli'])
            ->whereDate('tanggal', today());

        if ($request->filled('poli_id')) {
            $poliId = (int) $request->query('poli_id');
            $query->whereHas('schedule', function ($q) use ($poliId) {
                $q->where('poli_id', $poliId);
            });
        }

        $queues = $query->orderBy('nomor_antrean')->get();
        return response()->json($queues);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:waiting,calling,done,skipped',
        ]);

        $booking = Booking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();

        return response()->json([
            'success' => true,
            'data'    => Booking::with(['patient', 'schedule.doctor', 'schedule.poli'])
                ->find($booking->id),
        ]);
    }

    public function callQueue($id, FirebaseQueueService $firebaseService)
    {
        $booking = Booking::findOrFail($id);
        $booking->status = 'calling';
        $booking->save();

        try {
            $firebaseService->updateActiveQueue($booking);
        } catch (Throwable $e) {
            Log::error('Firebase Error: ' . $e->getMessage(), [
                'booking_id' => $booking->id,
            ]);
            // Tetap return 200 — DB sudah berubah, Firebase opsional di dev.
        }

        return response()->json([
            'success' => true,
            'message' => 'Queue called',
            'data'    => Booking::with(['patient', 'schedule.doctor', 'schedule.poli'])
                ->find($booking->id),
        ]);
    }
}
