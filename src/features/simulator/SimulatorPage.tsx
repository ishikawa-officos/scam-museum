import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PhoneFrame } from '@/components/ui/PhoneFrame';
import { LoadingHall, RoomNotReady } from '@/components/ui/LoadingHall';
import { PACE_INTERVAL, PACE_SPEECH_SCALE, usePlayStore } from '@/store/usePlayStore';
import type { Scenario } from './engine/types';
import { useScenario } from './engine/useScenario';
import { ChatSurface } from './surfaces/ChatSurface';
import { WebSurface } from './surfaces/WebSurface';
import { CallSurface } from './surfaces/CallSurface';
import { GroupChatSurface } from './surfaces/GroupChatSurface';
import { ChoicePanel } from './ChoicePanel';
import { AdvanceBar } from './AdvanceBar';
import { useScenarioRunner } from './engine/useScenarioRunner';

/** S-04 シミュレーター */
export function SimulatorPage() {
  const { scenarioId = '' } = useParams();
  const navigate = useNavigate();
  const { status, scenario } = useScenario(scenarioId);

  if (status === 'loading') return <LoadingHall label="展示室に入っています" />;
  if (status === 'missing') return <RoomNotReady onBack={() => navigate('/rooms')} />;

  // シナリオが変わったらランナーを作り直す
  return <Runner key={scenario.id} scenario={scenario} />;
}

function Runner({ scenario }: { scenario: Scenario }) {
  const navigate = useNavigate();
  const setResult = usePlayStore((s) => s.setResult);
  const pace = usePlayStore((st) => st.paceMode);
  const runner = useScenarioRunner(scenario, {
    ambientIntervalMs: PACE_INTERVAL[pace],
    paceScale: PACE_SPEECH_SCALE[pace],
  });
  const saved = useRef(false);
  // 一度でも送りを押したら、案内文を短くする（毎回説明されるとうるさい）
  const advanced = useRef(false);

  const { phase, ending, stats, choiceLog, beat, replay } = runner;

  // エンディング到達 → 結果を保存して判定画面へ
  useEffect(() => {
    if (phase !== 'ended' || !ending || saved.current) return;
    saved.current = true;
    setResult({
      scenarioId: scenario.id,
      endingId: ending.id,
      grade: ending.grade,
      stats,
      irreversibleChoices: choiceLog.filter((c) => c.irreversible).map((c) => c.label),
      savings: scenario.persona.savings,
      replay,
    });
    const timer = window.setTimeout(() => navigate(`/result/${scenario.id}`), 900);
    return () => window.clearTimeout(timer);
  }, [phase, ending, stats, choiceLog, replay, scenario, setResult, navigate]);

  // ステータスバーの時刻は、いま表示中のビートの時刻に追従させる
  // （数か月が経過していることを、端末の時計側からも感じさせる）
  const clock = (() => {
    for (let i = runner.transcript.length - 1; i >= 0; i--) {
      const item = runner.transcript[i];
      if (item.kind === 'time') return item.label.split(/[\s　]+/).pop() ?? '';
    }
    return scenario.beats[0]?.timeLabel?.split(/[\s　]+/).pop() ?? '9:41';
  })();

  const exit = () => navigate('/rooms');
  const speaking = phase === 'delivering' || phase === 'transition';
  // Web は読み込み後の静止画面なので、配信が終わってから見せる。
  // 通話は相手が話している最中こそ画面に出ている必要があるので、常に表示する。
  const onWeb = Boolean(beat?.web) && phase === 'choosing';
  const onCall = Boolean(beat?.call);
  const onGroup = Boolean(beat?.group);
  // 着信画面は応答／拒否を画面自身が描くので、下部の選択パネルは出さない
  const callTakesChoices = beat?.call?.state === 'incoming';

  // 相手の発言を待っている間だけ、選択肢と同じ場所に送りのバーを出す。
  // 選択待ちのときは出さない（選ぶのは本人なので、そこは飛ばせない）
  const waiting = speaking && !callTakesChoices;

  return (
    <PhoneFrame clock={clock} label={`${scenario.title} — 体験中のスマートフォン画面`}>
      {onGroup && beat?.group ? (
        <GroupChatSurface
          view={beat.group}
          speakers={scenario.speakers ?? {}}
          transcript={runner.transcript}
          typing={speaking}
          onExit={exit}
        />
      ) : onCall && beat?.call ? (
        <CallSurface
          view={beat.call}
          transcript={runner.transcript}
          speaking={speaking}
          choices={callTakesChoices ? runner.choices : []}
          onChoose={runner.choose}
        />
      ) : onWeb && beat?.web ? (
        <WebSurface
          view={beat.web}
          onExit={exit}
        />
      ) : (
        <ChatSurface
          contact={scenario.contact}
          transcript={runner.transcript}
          typing={speaking}
          onExit={exit}
        />
      )}
      {waiting && (
        <AdvanceBar
          onAdvance={() => {
            advanced.current = true;
            runner.advance();
          }}
          showHint={!advanced.current}
        />
      )}
      {!callTakesChoices && (
        <ChoicePanel
          key={beat?.id}
          choices={runner.choices}
          stats={stats}
          onChoose={runner.choose}
          timeLimit={beat?.timeLimit}
        />
      )}
    </PhoneFrame>
  );
}
