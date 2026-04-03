export function buildAllFightsQuery(reportCode: string): string {
  return `{
    reportData {
      report(code: "${reportCode}") {
        fights { id name startTime endTime }
      }
    }
  }`
}

export function buildReportMetaQuery(
  reportCode: string,
  fightId: number,
  startTime: number,
  endTime: number,
): string {
  return `{
    reportData {
      report(code: "${reportCode}") {
        fights(fightIDs: [${fightId}]) { id name startTime endTime }
        masterData { actors { id name type subType } }
        events(fightIDs: [${fightId}], dataType: CombatantInfo, startTime: ${startTime}, endTime: ${endTime}) {
          data
        }
      }
    }
  }`
}

export function buildEventsQuery(
  reportCode: string,
  fightId: number,
  sourceId: number,
  dataType: string,
  startTime: number,
  endTime: number,
): string {
  return `{
    reportData {
      report(code: "${reportCode}") {
        events(fightIDs: [${fightId}], sourceID: ${sourceId}, dataType: ${dataType},
               startTime: ${startTime}, endTime: ${endTime}) {
          data nextPageTimestamp
        }
      }
    }
  }`
}
