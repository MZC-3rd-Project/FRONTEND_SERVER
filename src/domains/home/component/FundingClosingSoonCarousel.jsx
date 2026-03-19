import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FUNDING_IMAGE_PLACEHOLDER } from "@/domains/client/funding/lib/fundingMappers";
import { buildFundingCampaignPath } from "@/domains/client/funding/lib/fundingPaths";

const AUTO_ADVANCE_INTERVAL_MS = 3500;

function resolveVisibleCount() {
    if (typeof window === "undefined") {
        return 3;
    }

    if (window.innerWidth >= 1280) {
        return 3;
    }

    if (window.innerWidth >= 768) {
        return 2;
    }

    return 1;
}

function useResponsiveVisibleCount() {
    const [visibleCount, setVisibleCount] = useState(resolveVisibleCount);

    useEffect(() => {
        function handleResize() {
            setVisibleCount(resolveVisibleCount());
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return visibleCount;
}

function FundingClosingSoonSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
                <Card
                    key={`closing-soon-funding-skeleton-${index}`}
                    className="h-full border-border bg-card shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                >
                    <div className="h-40 w-full animate-pulse rounded-t-xl bg-muted" />
                    <CardHeader className="space-y-3 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                        <div className="flex items-end justify-between gap-3">
                            <div className="space-y-2">
                                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            </div>
                            <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function FundingClosingSoonCard({ project }) {
    return (
        <Link to={buildFundingCampaignPath(project.id)} className="block h-full">
            <Card className="h-full border-border bg-card shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
                <img
                    src={project.thumbnailUrl || FUNDING_IMAGE_PLACEHOLDER}
                    alt={project.title}
                    className="h-40 w-full rounded-t-xl object-cover"
                />
                <CardHeader className="pb-2">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                            {project.category}
                        </span>
                        <span className="font-medium text-muted-foreground">{project.leftLabel}</span>
                    </div>
                    <CardTitle className="line-clamp-2 min-h-11 text-base leading-snug text-card-foreground">
                        {project.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${Math.min(project.progressRate, 100)}%` }}
                        />
                    </div>
                    <div className="flex items-end justify-between gap-3 text-sm">
                        <div>
                            <p className="font-semibold text-card-foreground">{project.currentAmountText}</p>
                            <p className="text-xs text-muted-foreground">목표 {project.goalAmountText}</p>
                        </div>
                        <p className="text-lg font-bold text-primary">{project.progressRateText}%</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function buildLoopedProjects(projects, visibleCount) {
    if (projects.length <= visibleCount) {
        return projects;
    }

    return [
        ...projects.slice(-visibleCount),
        ...projects,
        ...projects.slice(0, visibleCount),
    ];
}

function toRealIndex(activeIndex, projectLength, visibleCount) {
    return ((activeIndex - visibleCount) % projectLength + projectLength) % projectLength;
}

export default function FundingClosingSoonCarousel({
    projects,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    isFetching,
}) {
    const visibleCount = useResponsiveVisibleCount();

    if (isLoading) {
        return <FundingClosingSoonSkeleton />;
    }

    if (isError) {
        return (
            <Card className="border-destructive/40 bg-card">
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-card-foreground">
                                마감 임박 펀딩을 불러오지 못했습니다.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {errorMessage ?? "잠시 후 다시 시도해 주세요."}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={onRetry}
                        disabled={isFetching}
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                        다시 시도
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (projects.length === 0) {
        return (
            <Card className="border-dashed border-border bg-card">
                <CardContent className="p-6 text-sm text-muted-foreground">
                    지금은 노출할 마감 임박 펀딩이 없습니다.
                </CardContent>
            </Card>
        );
    }

    const canLoop = projects.length > visibleCount;

    if (!canLoop) {
        return (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                    <FundingClosingSoonCard key={project.id} project={project} />
                ))}
            </div>
        );
    }

    return (
        <FundingClosingSoonCarouselViewport
            key={`${visibleCount}-${projects.length}`}
            projects={projects}
            visibleCount={visibleCount}
        />
    );
}

function FundingClosingSoonCarouselViewport({ projects, visibleCount }) {
    const loopedProjects = useMemo(
        () => buildLoopedProjects(projects, visibleCount),
        [projects, visibleCount]
    );
    const [activeIndex, setActiveIndex] = useState(visibleCount);
    const [enableTransition, setEnableTransition] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (enableTransition) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setEnableTransition(true);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [enableTransition]);

    useEffect(() => {
        if (isPaused) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setActiveIndex((currentIndex) => currentIndex + 1);
        }, AUTO_ADVANCE_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [isPaused]);

    function handleNext() {
        setActiveIndex((currentIndex) => currentIndex + 1);
    }

    function handlePrevious() {
        setActiveIndex((currentIndex) => currentIndex - 1);
    }

    function handleTransitionEnd() {
        if (activeIndex < visibleCount) {
            setEnableTransition(false);
            setActiveIndex(projects.length + activeIndex);
            return;
        }

        if (activeIndex >= projects.length + visibleCount) {
            setEnableTransition(false);
            setActiveIndex(activeIndex - projects.length);
        }
    }

    function handleIndicatorClick(projectIndex) {
        setActiveIndex(visibleCount + projectIndex);
    }

    const currentIndex = toRealIndex(activeIndex, projects.length, visibleCount);

    return (
        <div
            className="space-y-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
        >
            <div className="relative">
                <div className="overflow-hidden">
                    <div
                        className="-mx-2 flex"
                        style={{
                            transform: `translateX(-${(activeIndex * 100) / visibleCount}%)`,
                            transition: enableTransition ? "transform 500ms ease" : "none",
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {loopedProjects.map((project, index) => (
                            <div
                                key={`${project.id}-${index}`}
                                className="shrink-0 px-2"
                                style={{ flexBasis: `${100 / visibleCount}%` }}
                            >
                                <FundingClosingSoonCard project={project} />
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 left-1 z-10 -translate-y-1/2 rounded-full bg-background/90 shadow-sm"
                    onClick={handlePrevious}
                    aria-label="이전 펀딩 보기"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-1/2 right-1 z-10 -translate-y-1/2 rounded-full bg-background/90 shadow-sm"
                    onClick={handleNext}
                    aria-label="다음 펀딩 보기"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
                {projects.map((project, index) => (
                    <button
                        key={project.id}
                        type="button"
                        className={cn(
                            "h-2.5 rounded-full bg-muted transition-all",
                            index === currentIndex ? "w-8 bg-primary" : "w-2.5 hover:bg-muted-foreground/40"
                        )}
                        onClick={() => handleIndicatorClick(index)}
                        aria-label={`${index + 1}번째 펀딩 보기`}
                    />
                ))}
            </div>
        </div>
    );
}
