import { ReplayStore } from '../../src/domain/specification/scgs/replay/store';
import { ReplayValidator } from '../../src/domain/specification/scgs/replay/validator';

async function main() {
    const traceId = process.env.TRACE_ID;
    if (!traceId) throw new Error("TRACE_ID required");

    const replayStore = new ReplayStore('.scgs/replay');
    
    console.log("Loading trace and validating integrity...");
    const trace = await replayStore.loadTrace(traceId);
    
    // In production, artifacts would be retrieved based on snapshot refs in the trace
    const mockArtifact: any = { compiled: { grouped: [], facets: {} } }; 
    
    const validation = ReplayValidator.validate(mockArtifact, mockArtifact, trace);
    
    if (!validation.ok) {
        console.error("REPLAY_VALIDATION_FAILED", validation);
        process.exit(1);
    }
    
    console.log("REPLAY_VALIDATION_PASSED");
    process.exit(0);
}

main().catch(console.error);
